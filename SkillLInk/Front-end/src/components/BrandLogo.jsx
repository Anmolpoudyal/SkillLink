const BrandLogo = ({ imageClassName = "", alt = "SkillLink logo" }) => {
  return (
    <img
      src="/skilllinkLogo.png"
      alt={alt}
      className={`w-auto object-contain ${imageClassName}`.trim()}
    />
  );
};

export default BrandLogo;
