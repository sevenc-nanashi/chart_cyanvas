import Image from "next/image"
import { ComponentProps } from "react"

const OptionalImage: React.FC<
  { src: string | undefined; alt: string | undefined } & Omit<
    ComponentProps<typeof Image>,
    "src" | "alt"
  >
> = ({ src, alt, ...props }) => {
  if (src) {
    return <Image src={src} alt={alt || ""} {...props} />
  } else {
    return (
      <div
        className={
          `bg-white dark:bg-gray-700 flex justify-center items-center animate-pulse ` +
          props.className
        }
        style={{
          ...props.style,
        }}
      />
    )
  }
}

export default OptionalImage
