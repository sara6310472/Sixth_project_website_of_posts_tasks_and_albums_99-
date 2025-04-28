import { useData } from "../hooks/useData";
import { useParams } from "react-router-dom";
import { SearchBar } from "./SearchBar";
import { useState } from "react";
import Album from "./Album";
import "../style/Albums.css";

function Albums() {
  const { userId } = useParams();
  const {
    data: albums,
    isLoading,
    filters,
    setFilters,
    add: addAlbum,
    delete: deleteAlbum,
    edit: editAlbum,
  } = useData({
    resourceType: "albums",
    itemId: userId,
  });

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState("");

  const handleAddAlbum = async () => {
    if (!newAlbumTitle.trim()) return;
    await addAlbum({ title: newAlbumTitle });
    setNewAlbumTitle("");
    setIsFormVisible(false);
  };

  return (
    <div className="pageContainer">
      <div className="pageHeader">
        <h1>Albums</h1>
        <div className="controlsGroup">
          <SearchBar
            setFilters={setFilters}
            filters={filters}
            setIsFormVisible={setIsFormVisible}
          />

          {isFormVisible && (
            <div className="addItemForm">
              <input
                type="text"
                className="formInput"
                placeholder="Add new..."
                value={newAlbumTitle}
                onChange={(e) => setNewAlbumTitle(e.target.value)}
              />
              <button className="btn btnPrimary" onClick={handleAddAlbum}>
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="gridLayout">
        {isLoading ? (
          <h3>Loading...</h3>
        ) : albums.length === 0 ? (
          <div>No albums available</div>
        ) : (
          albums.map((album) => (
            <Album
              key={album.id}
              album={album}
              onDelete={deleteAlbum}
              onEdit={editAlbum}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Albums;
