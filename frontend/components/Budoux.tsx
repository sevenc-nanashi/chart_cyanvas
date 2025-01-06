export default function Budoux({ children }: { children: React.ReactNode }) {
  // @ts-expect-error Not recognized by TypeScript
  return <budoux-ja>{children}</budoux-ja>;
}
