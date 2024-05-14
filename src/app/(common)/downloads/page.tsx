import Product from "~/components/ui/Product/Product";

export default function DownloadsPage() {
  return (
    <div className="flex flex-col items-center px-24">
      <div className="mt-24 grid justify-items-center gap-10 lg:grid-cols-2 xl:grid-cols-3">
      <Product
          product={{
            title: "Aurora",
            description: "A collection of 20 unique melodies.",
            downloadLink: "downloadLink",
            imageSrc: "/placeholder.jpg",
          }}
        />
      </div>
    </div>
  );
}
