type BrandLogoProps = {
  className?: string;
  variant?: "light" | "dark";
};

export default function BrandLogo({
  className = "",
  variant = "light",
}: BrandLogoProps) {
  const source = variant === "light"
    ? "/brand/musicacom-logo-horizontal-light.png"
    : "/brand/musicacom-logo-horizontal.png";

  return (
    <span className={`brand-logo ${className}`.trim()}>
      <img
        src={source}
        alt="musicacom.ia"
        width="610"
        height="70"
        decoding="async"
      />
    </span>
  );
}
