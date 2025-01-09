// 'use client'

// // import clsx from "clsx"
// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import { useMemo } from "react"

// interface Props {
//   href: string
//   children: React.ReactNode
//   className?: string
// }

// export const ActiveLink = ({href, children, className}: Props) => {
//   const pathname = usePathname()
//   const isActive : boolean = useMemo(() => {
//     return pathname === href
//   }, [pathname, href])

//   return (
//     // <Link
//     //   className={
//     //     // clsx(
//     //     //   isActive ?  ' ' : '',
//     //     //   'font-medium animate  w-full block rounded ',
//     //     //   className
//     //     // )
//     //   }
//     //   href={href}
//     // >
//     //   {children}
//     // </Link>
//   )
// }
