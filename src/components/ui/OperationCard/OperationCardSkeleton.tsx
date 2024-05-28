export default function OperationCardSkeleton() {
  return (
    <div className="flex h-[5.5rem] w-[21rem] animate-pulse flex-row gap-2 rounded-2xl  border-[1px] bg-colors-background-950 px-5 py-2 pt-4">
      <div className="flex flex-col">
        <h1 className="text-base font-medium "></h1>
        <p className="mt-[0.2rem] text-sm text-white/80"></p>
      </div>
    </div>
  );
}
