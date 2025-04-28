import { MdDelete, MdEdit, MdSave, MdClose, MdZoomIn } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useState } from "react";

function Photo(props) {
  const { photo, onEdit, onDelete } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [showFullSize, setShowFullSize] = useState(false);
  const [editedPhoto, setEditedPhoto] = useState({
    title: photo.title,
    url: photo.url,
    thumbnailUrl: photo.thumbnailUrl,
    albumId: photo.albumId,
  });

  const navigate = useNavigate();

  return (
    <>
      <div className="photoCard">
        <img src={photo.thumbnailUrl} alt={photo.title} />
        <div className="photoOverlay">
          {isEditing ? (
            <div className="photoEditForm">
              <input
                type="text"
                className="formInput"
                placeholder="Title..."
                value={editedPhoto.title}
                onChange={(e) =>
                  setEditedPhoto((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
              <input
                type="text"
                className="formInput"
                placeholder="URL..."
                value={editedPhoto.url}
                onChange={(e) =>
                  setEditedPhoto((prev) => ({
                    ...prev,
                    thumbnailUrl: e.target.value,
                  }))
                }
              />
              <div className="photoActions">
                <button
                  className="btn btnPrimary"
                  onClick={() => {
                    onEdit(photo.id, editedPhoto);
                    setIsEditing(false);
                  }}
                >
                  <MdSave />
                </button>
                <button
                  className="btn btnSecondary"
                  onClick={() => setIsEditing(false)}
                >
                  <MdClose />
                </button>
              </div>
            </div>
          ) : (
            <>
              <h4 className="photoTitle">{photo.title}</h4>
              <div className="photoActions">
                <button
                  className="btn btnSecondary"
                  onClick={() => {
                    setShowFullSize(true);
                    navigate(`${photo.id}`);
                  }}
                >
                  <MdZoomIn />
                </button>
                <button
                  className="btn btnSecondary"
                  onClick={() => setIsEditing(true)}
                >
                  <MdEdit />
                </button>
                <button
                  className="btn btnDanger"
                  onClick={() => onDelete(photo.id)}
                >
                  <MdDelete />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showFullSize && (
        <div className="photoModal">
          <div className="photoModalContent">
            <img src={photo.url} alt={photo.title} />
            <button
              className="closeButton"
              onClick={() => {
                setShowFullSize(false);
                const index = location.pathname.indexOf("photos");
                if (index !== -1) {
                  const newPath = location.pathname.substring(
                    0,
                    index + "photos".length
                  );
                  navigate(newPath);
                }
              }}
            >
              <MdClose />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

Photo.propTypes = {
  photo: PropTypes.shape({
    id: PropTypes.string.isRequired,
    albumId: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    thumbnailUrl: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default Photo;
