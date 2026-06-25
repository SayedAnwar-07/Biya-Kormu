import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";

const GalleryImage = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const sortedImages = useMemo(() => {
    if (!images) return [];
    return [...images].sort((a, b) => a.position - b.position);
  }, [images]);

  const handleImageClick = (img, index) => {
    setSelectedImage(img);
    setCurrentIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const navigateImages = (direction) => {
    let newIndex;
    if (direction === "prev") {
      newIndex = (currentIndex - 1 + sortedImages.length) % sortedImages.length;
    } else {
      newIndex = (currentIndex + 1) % sortedImages.length;
    }
    setCurrentIndex(newIndex);
    setSelectedImage(sortedImages[newIndex]);
  };

  if (sortedImages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-muted/50 rounded-xl">
        <Camera className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No gallery images available</p>
      </div>
    );
  }

  return (
    <div className="mb-6 md:mb-8">
      {/* 3-column grid layout with custom row heights */}
      <div className="grid grid-cols-3 gap-1 md:gap-2">
        {sortedImages.map((img, index) => {
          // First image spans 2 columns
          const isFirstImage = index === 0;
          // First row (first two images)
          const isFirstRow = index < 2;

          return (
            <div
              key={img.position}
              className={`rounded-md md:rounded-lg overflow-hidden bg-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer ${
                isFirstImage ? "col-span-2 row-span-1" : "col-span-1"
              }`}
              onClick={() => handleImageClick(img, index)}
            >
              <img
                src={img.image}
                alt={`Event image ${index + 1}`}
                className={`w-full object-cover hover:scale-105 transition-transform duration-500 ${
                  isFirstRow
                    ? "h-[150px] md:h-[250px] lg:h-[400px]"
                    : "h-[100px] md:h-[180px] lg:h-[280px]"
                }`}
                loading="lazy"
              />
            </div>
          );
        })}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCloseModal();
            }}
            className="absolute top-4 right-4 z-[60] text-white hover:text-gray-300 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-8 w-8" />
          </button>

          <div
            className="relative w-full max-w-6xl h-full max-h-[90vh] flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => navigateImages("prev")}
              className="absolute left-4 z-40 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              disabled={sortedImages.length <= 1}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <div className="w-full h-full flex items-center justify-center">
              <img
                src={selectedImage.image}
                alt={`Full size event image`}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <button
              onClick={() => navigateImages("next")}
              className="absolute right-4 z-40 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              disabled={sortedImages.length <= 1}
              aria-label="Next image"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </div>

          {sortedImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {sortedImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GalleryImage;
