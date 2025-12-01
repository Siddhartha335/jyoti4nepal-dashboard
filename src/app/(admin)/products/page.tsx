import ListProducts from "@components/products/list"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Products",
  description: "Manage, edit, and publish products from your admin panel.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

const page = () => {
  return (
    <ListProducts />
  )
}

export default page