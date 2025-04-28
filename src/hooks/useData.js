import { useState, useCallback, useEffect } from "react";

const BASE_URL = "http://localhost:3000";

export const useData = ({
  resourceType,
  itemId,
  hasPagination = false,
  defaultFilters = {
    searchTerm: "",
    searchById: "",
    sortBy: "id",
    completed: null,
  },
}) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const parentIdField = {
    albums: "userId",
    todos: "userId",
    posts: "userId",
    photos: "albumId",
    comments: "postId",
  }[resourceType];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `${BASE_URL}/${resourceType}?${parentIdField}=${itemId}`;

      if (hasPagination) {
        url += `&_page=${page}&_per_page=4`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Error");

      const result = await response.json();

      if (hasPagination) {
        setData((prev) => [...prev, ...result.data]);
        setHasMore((result.pages !== page) & result.pages);
        setPage((prev) => prev + 1);
      } else {
        setData(result);
      }
    } catch (error) {
      console.error(`Error fetching ${resourceType}:`, error);
    }
    setIsLoading(false);
  }, [resourceType, itemId, page, hasPagination, parentIdField]);

  useEffect(() => {
    if (!hasPagination) {
      fetchData();
    }
  }, [fetchData, hasPagination]);

  const addItem = async (itemData) => {
    try {
      const response = await fetch(`${BASE_URL}/${resourceType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [parentIdField]: itemId,
          ...itemData,
          // ...(resourceType === "photos" ? { thumbnailUrl: itemData.url } : {}),
        }),
      });
      if (!response.ok) throw new Error("Error");
      const newItem = await response.json();
      setData((prev) => [newItem, ...prev]);
      return newItem;
    } catch (error) {
      console.error(`Error adding ${resourceType}:`, error);
    }
  };

  const editItem = async (id, updates) => {
    try {
      const response = await fetch(`${BASE_URL}/${resourceType}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          [parentIdField]: itemId,
          ...updates,
        }),
      });
      if (!response.ok) throw new Error("Error");
      const updatedItem = await response.json();
      setData((prev) =>
        prev.map((item) => (item.id === id ? updatedItem : item))
      );
      return updatedItem;
    } catch (error) {
      console.error(`Error updating ${resourceType}:`, error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await fetch(`${BASE_URL}/${resourceType}/${id}`, {
        method: "DELETE",
      });

      if (resourceType === "albums") {
        const photos = await fetch(`${BASE_URL}/photos?albumId=${id}`).then(
          (res) => res.json()
        );
        for (const photo of photos) {
          const res = await fetch(`${BASE_URL}/photos/${photo.id}`, {
            method: "DELETE",
          });
          console.log(res.ok);
        }
      } else if (resourceType === "posts") {
        const comments = await fetch(`${BASE_URL}/comments?postId=${id}`).then(
          (res) => res.json()
        );
        for (const comment of comments) {
          await fetch(`${BASE_URL}/comments/${comment.id}`, {
            method: "DELETE",
          });
        }
      }

      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(`Error deleting ${resourceType}:`, error);
    }
  };

  const toggleItem = async (item) => {
    if (resourceType !== "todos") return;

    try {
      const response = await fetch(`${BASE_URL}/todos/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          completed: !item.completed,
        }),
      });
      if (!response.ok) throw new Error("Error");
      const updatedItem = await response.json();
      setData((prev) =>
        prev.map((todo) => (todo.id === item.id ? updatedItem : todo))
      );
      return updatedItem;
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  const getAllItem = async (id) => {
    if (resourceType !== "posts") return;

    if (id) {
      fetchData();
      return;
    }
    try {
      let url = `${BASE_URL}/${resourceType}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Error");
      const result = await response.json();

      setData(result);
    } catch (error) {
      console.error(`Error fetching ${resourceType}:`, error);
    }
  };

  const filteredData = useCallback(() => {
    return [...data]
      .filter((item) => {
        const searchField = item.title || item.body || "";
        const matchesSearch = searchField
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase());

        const matchesId = item.id.toString().includes(filters.searchById);

        const matchesCompleted =
          filters.completed === null ||
          !("completed" in item) ||
          item.completed === !filters.completed;

        return matchesSearch && matchesId && matchesCompleted;
      })
      .sort((a, b) => {
        if (filters.sortBy === "id") return a.id - b.id;
        if (filters.sortBy === "title") {
          const aField = a.title || a.body || "";
          const bField = b.title || b.body || "";
          return aField.localeCompare(bField);
        }
        return 0;
      });
  }, [data, filters]);

  return {
    data: filteredData(),
    isLoading,
    filters,
    setFilters,
    hasMore,
    fetchMore: hasPagination ? fetchData : undefined,
    add: addItem,
    edit: editItem,
    delete: deleteItem,
    toggle: toggleItem,
    getAll: getAllItem,
  };
};
