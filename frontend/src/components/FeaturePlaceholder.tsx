interface FeaturePlaceholderProps {
  feature: string;
}

export default function FeaturePlaceholder({
  feature,
}: FeaturePlaceholderProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0D12] px-4 text-[#F3F4F8]">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#8B7CFF]">
          Nexus
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Hello World</h1>
        <p className="mt-3 text-sm text-[#A0A6B5]">
          {feature} is under development.
        </p>
      </div>
    </main>
  );
}
