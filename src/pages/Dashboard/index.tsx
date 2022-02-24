import { useState, useCallback } from "react";

import { Header } from '../../components/Header'
import { Food } from '../../components/Food'
import { ModalAddFood } from "../../components/ModalAddFood";
import { ModalEditFood } from "../../components/ModalEditFood";
import { TypeFood } from "../../components/Food";

import api from '../../services/api';

import { FoodsContainer } from "./styles";
import { useEffect } from "react";

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [foods, setFoods] = useState<TypeFood[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState({} as TypeFood);

  useEffect(() => {
    api.get("/foods").then((response) => {
      setFoods(response.data)
    })
  }, [setFoods])

  const toggleModal = useCallback(() => {
    setModalOpen(!modalOpen)
  }, [setModalOpen, modalOpen])

  const handleAddFood = useCallback(async (food) => {
    try {
      const response = await api.post("/foods", {
        ...food,
        available: true,
      })
      setFoods([...foods, response.data])
    } catch (error) {
      alert(`Error: ${error}`)
    }
  }, [setFoods, foods])

  const toggleEditModal = useCallback(() => {
    setEditModalOpen(!editModalOpen)
  }, [setEditModalOpen, editModalOpen])

  const handleEditFood = useCallback(async (food) => {
    setEditingFood(food);
    setEditModalOpen(!editModalOpen);
  }, [setEditingFood, setEditModalOpen, editModalOpen])

  const handleUpdateFood = useCallback(async (food) => {
    try {
      const foodUpdated = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );
      const foodsUpdated = foods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );
      setFoods(foodsUpdated);

    } catch (error) {
      alert(`Error: ${error}`)
    }
  }, [editingFood, foods])

  const handleDeleteFood = useCallback(async (id) => {
    await api.delete(`/foods/${id}`);
    const foodsFiltered = foods.filter(food => food.id !== id);
    setFoods(foodsFiltered)
  }, [setFoods, foods])

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
}