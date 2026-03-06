type ImageModule = {
  default: string;
};

export const importImages = (
  modules: Record<string, ImageModule>,
): Record<string, string> => {
  const images: Record<string, string> = {};

  Object.entries(modules).forEach(([path, module]) => {
    const fileName = path
      .split("/")
      .pop()
      ?.replace(/\.(png|jpg|jpeg|svg|webp)$/i, "");

    if (fileName) {
      images[fileName] = module.default;
    }
  });

  return images;
};
