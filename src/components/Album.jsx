import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useData } from "../hooks/useData";
import PropTypes from "prop-types";
import Photo from "./Photo.jsx";
import {
  MdDelete,
  MdEdit,
  MdSave,
  MdClose,
  MdHideImage,
  MdImage,
  MdZoomIn,
} from "react-icons/md";

function Album(props) {
  const { album, onDelete, onEdit } = props;
  const {
    data: photos,
    hasMore,
    fetchMore,
    add: addPhoto,
    delete: deletePhoto,
    edit: editPhoto,
  } = useData({
    resourceType: "photos",
    itemId: album.id,
    hasPagination: true,
  });

  const [newPhoto, setNewPhoto] = useState({
    url: "",
    title: "",
  });

  const [showPhotos, setShowPhotos] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(album.title);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const id = location.pathname.split("/").pop();
    if (id == album.id && !showModal) {
      setShowModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleAddPhoto = async () => {
    if (!newPhoto.url.trim() || !newPhoto.title.trim()) return;

    await addPhoto(newPhoto);
    setNewPhoto({ url: "", title: "" });
  };

  return (
    <div className={`${!showModal && "itemCard"}`}>
      <div className="itemHeader">
        <span className="itemId">#{album.id}</span>
        <span className="itemTitle">{album.title}</span>
        <div className="itemActions">
          <button
            className="btn btnSecondary"
            onClick={() => {
              navigate(`${album.id}`);
            }}
          >
            <MdZoomIn />
          </button>
        </div>
        {showModal && (
          <div
            className="itemModal"
            onClick={() => {
              setShowModal(false);
              const index = location.pathname.indexOf("albums");
              if (index !== -1) {
                const newPath = location.pathname.substring(
                  0,
                  index + "albums".length
                );
                navigate(newPath);
              }
            }}
          >
            <div
              className="itemModalContent"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="itemCard modalCard">
                {isEditing ? (
                  <input
                    type="text"
                    className="editInput"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                ) : (
                  <span className="itemTitle">{album.title}</span>
                )}
              </div>

              <div className="itemActions">
                {isEditing ? (
                  <>
                    <button
                      className="btn btnPrimary"
                      onClick={() => {
                        onEdit(album.id, {title});
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
                  </>
                ) : (
                  <>
                    <button
                      className="btn btnSecondary"
                      onClick={() => {
                        setIsEditing(true);
                      }}
                    >
                      <MdEdit />
                    </button>
                    <button
                      className="btn btnSecondary"
                      onClick={() => {
                        if (!showPhotos) {
                          fetchMore();
                        }
                        setShowPhotos((prev) => !prev);
                        location.pathname.includes("photos")
                          ? navigate(location.pathname.replace("/photos", ""))
                          : navigate("photos");
                      }}
                    >
                      {showPhotos ? <MdHideImage /> : <MdImage />}
                    </button>
                    <button
                      className="btn btnDanger"
                      onClick={() => {
                        onDelete(album.id);
                        const index = location.pathname.indexOf("albums");
                        if (index !== -1) {
                          const newPath = location.pathname.substring(
                            0,
                            index + "albums".length
                          );
                          navigate(newPath);
                        }
                      }}
                    >
                      <MdDelete />
                    </button>
                  </>
                )}
              </div>

              {showPhotos && (
                <div className="photosSection">
                  <div className="commentsForm">
                    <input
                      type="text"
                      className="formInput"
                      placeholder="Photo URL..."
                      value={newPhoto.url}
                      onChange={(e) =>
                        setNewPhoto((prev) => ({
                          ...prev,
                          url: e.target.value,
                        }))
                      }
                    />
                    <input
                      type="text"
                      className="formInput"
                      placeholder="Photo title..."
                      value={newPhoto.title}
                      onChange={(e) =>
                        setNewPhoto((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                    <button className="btn btnPrimary" onClick={handleAddPhoto}>
                      Add Photo
                    </button>
                  </div>
                  <div className="photosGrid">
                    {photos.map((photo) => (
                      <div key={photo.id} className="photoCard">
                        <Photo
                          photo={photo}
                          onEdit={editPhoto}
                          onDelete={deletePhoto}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    className="btnShowmore"
                    disabled={!hasMore}
                    onClick={() => {
                      fetchMore();
                    }}
                  >
                    Show more
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Album.propTypes = {
  album: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default Album;
