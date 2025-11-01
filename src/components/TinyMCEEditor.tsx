"use client";

import React, { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
  disabled?: boolean;
}

const TinyMCEEditorComponent: React.FC<TinyMCEEditorProps> = ({
  value,
  onChange,
  height = 400,
  placeholder = "Start typing...",
  disabled = false,
}) => {
  const editorRef = useRef<TinyMCEEditor | null>(null);

  // Compress and resize image to keep it under 500KB
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          
          // Maximum dimensions (adjust as needed)
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          // Resize if image is too large
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Start with quality 0.9 and reduce if needed
          let quality = 0.9;
          let compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          
          // Calculate base64 size (roughly file size)
          const getBase64Size = (base64: string) => {
            const stringLength = base64.length - "data:image/jpeg;base64,".length;
            const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812;
            return sizeInBytes;
          };
          
          // Reduce quality until image is under 500KB
          const MAX_SIZE = 500 * 1024; // 500KB in bytes
          while (getBase64Size(compressedDataUrl) > MAX_SIZE && quality > 0.1) {
            quality -= 0.1;
            compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          }
          
          console.log(`Image compressed: ${(getBase64Size(compressedDataUrl) / 1024).toFixed(2)}KB at ${(quality * 100).toFixed(0)}% quality`);
          
          resolve(compressedDataUrl);
        };
        
        img.onerror = () => {
          reject("Failed to load image");
        };
      };
      
      reader.onerror = () => {
        reject("Failed to read file");
      };
    });
  };

  // Handle image upload with compression
  const handleImageUpload = (
    blobInfo: any,
    progress: (percent: number) => void
  ): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const file = blobInfo.blob();
        
        // Check if file is an image
        if (!file.type.startsWith("image/")) {
          reject("File must be an image");
          return;
        }
        
        // Compress the image
        const compressedBase64 = await compressImage(file);
        resolve(compressedBase64);
      } catch (error) {
        reject("Failed to compress image: " + error);
      }
    });
  };

  return (
    <div className="tinymce-wrapper">
      <Editor
        apiKey="l9eggsyzrbz8rp43h8cef3n04nmjd181wr17tcwm0x6hwu6b"
        onInit={(evt, editor) => {
          editorRef.current = editor;
        }}
        value={value}
        onEditorChange={onChange}
        disabled={disabled}
        init={{
          height: height,
          menubar: true,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "image link | removeformat | code | help",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px; } img { max-width: 100%; height: auto; }",
          placeholder: placeholder,
          skin: "oxide",
          content_css: "default",
          branding: false,
          promotion: false,

          // IMAGE UPLOAD CONFIGURATION
          images_upload_handler: handleImageUpload,
          automatic_uploads: true,
          images_reuse_filename: true,
          
          // Force images to display properly
          extended_valid_elements: "img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name|style]",
          forced_root_block: 'p',
          
          // Image plugin options
          image_advtab: true,
          image_caption: true,
          image_title: true,

          // Allow file picker (browse button)
          file_picker_types: "image",
          file_picker_callback: async (callback, value, meta) => {
            if (meta.filetype === "image") {
              const input = document.createElement("input");
              input.setAttribute("type", "file");
              input.setAttribute("accept", "image/*");

              input.onchange = async function () {
                const file = (input as HTMLInputElement).files?.[0];
                if (file) {
                  try {
                    // Compress the image before inserting
                    const compressedBase64 = await compressImage(file);
                    
                    // Call callback with the compressed image
                    callback(compressedBase64, {
                      alt: file.name,
                      title: file.name,
                    });
                    
                    // Force editor to refresh content
                    if (editorRef.current) {
                      editorRef.current.setContent(editorRef.current.getContent());
                    }
                  } catch (error) {
                    console.error("Failed to compress image:", error);
                    alert("Failed to process image. Please try another image.");
                  }
                }
              };

              input.click();
            }
          },

          // Setup callback to ensure images display
          setup: (editor) => {
            editor.on('init', () => {
              // Ensure all images have proper styling
              const content = editor.getContent();
              if (content) {
                editor.setContent(content);
              }
            });
            
            // When content changes, ensure images display
            editor.on('SetContent', () => {
              const body = editor.getBody();
              const images = body.querySelectorAll('img');
              images.forEach((img: any) => {
                if (!img.style.maxWidth) {
                  img.style.maxWidth = '100%';
                  img.style.height = 'auto';
                }
              });
            });
          },

          // Image upload settings
          images_upload_base_path: "/uploads",
          images_upload_credentials: true,
        }}
      />
    </div>
  );
};

export default TinyMCEEditorComponent;