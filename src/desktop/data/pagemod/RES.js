let RES = {
  /**
   * Creates an object representing the RES mark-up structure
   * for an image viewer.
   *
   * @param {HTMLImageElement} aImage
   *        The image that is converted to a video.
   *
   * @return {object}
   *         Object representing the image viewer mark-up structure.
   */
  getViewer: function(aImage) {
    return {
      container: {
        get element () {
          return aImage.parentNode.parentNode.parentNode;
        },
        gallerycontrols: {
          get element () {
            try {
              return aImage.parentNode.parentNode.parentNode.querySelector(".RESGalleryControls");
            } catch(ex) {
            }
            return null;
          }
        },
        anchor: {
          get element () {
            return aImage.parentNode;
          },
          image: {
            get element () {
              return aImage;
            }
          }
        }
      }
    };
  }
};