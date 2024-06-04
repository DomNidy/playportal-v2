// "use client";
// import { motion } from "framer-motion";
// import React from "react";

// TODO: Implement a lightweight component that smoothly "fades in" the text content
// TODO: We want to use this on the landing page, so we would prefer to use server components somehow
// export default function FadeInWhenVisible({
//   children,
//   containerClassName,
// }: {
//   children: React.ReactNode;
//   containerClassName: string;
// }) {
//   return (
//     <motion.div
//       className={containerClassName}
//       whileInView={"visible"}
//       initial={"hidden"}
//       viewport={{
//         once: true,
//       }}
//       transition={{ duration: 0.5 }}
//       variants={{
//         visible: { opacity: 1, scale: 1 },
//         hidden: { opacity: 0, scale: 0.65 },
//       }}
//     >
//       {children}
//     </motion.div>
//   );
// }
