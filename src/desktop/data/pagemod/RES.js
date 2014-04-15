let RES = {
  /**
   * Creates an object representing the RES mark-up structure
   * for an image viewer.
   *
   * @param element aImage
   *        The image that is converted to a video.
   *
   * @return object
   *         Object representing the image viewer mark-up structure.
   */
  getViewer: function(aImage) {
    return {
      container: {
        getElement: () => {
          return aImage.parentNode.parentNode.parentNode;
        },
        gallerycontrols: {
          getElement: () => {
            try {
              return aImage.parentNode.parentNode.parentNode.querySelector(".RESGalleryControls");
            } catch(ex) {
            }
            return null;
          }
        },
        anchor: {
          getElement: () => {
            return aImage.parentNode;
          },
          image: {
            getElement: () => {
              return aImage;
            }
          }
        }
      }
    };
  },
};