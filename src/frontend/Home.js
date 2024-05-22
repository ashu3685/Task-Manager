import React, { useState, useEffect } from 'react';
import TodoForm from './TodoForm';
import TodoItem from './TodoItem'; // Import the TodoItem component

const Home = () => {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetchTodos(); // Fetch todos on component mount
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`https://w3villa-1mal.onrender.com/todos`, {
        method: 'GET',
        credentials: 'include', // Include credentials for authentication
      });

      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }

      const data = await response.json();
      setTodos(data); // Set todos from the response
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async (todoText) => {
    try {
        const response = await fetch(`https://w3villa-1mal.onrender.com/saveTodo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ todoText }),
          credentials: 'include',
        });
  
        if (!response.ok) {
          throw new Error('Failed to save todo');
        }
        
        await fetchTodos();
        // Clear the input field after submission
      } catch (error) {
        console.error('Error saving todo:', error);
      }
   
  };


  const onUpdate = async (todoId, newText) => {
    try {
      const response = await fetch(`https://w3villa-1mal.onrender.com/updateTodo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ todoId, newText }),
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error('Failed to update todo');
      }
      
      await fetchTodos();
      
     
      
    } catch (error) {
      console.error('Error updating todo:', error);
    }

  };

  

const onDelete = async (todoId) => {
    try {
      const response = await fetch(`https://w3villa-1mal.onrender.com/deleteTodo`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ todoId }), // Send the todo ID in the request body
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }
      
      await fetchTodos();
     
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };



  return (
    <div className="bg-[#172842] min-h-screen py-8">
      <div className="w-full max-w-2xl mx-auto shadow-md rounded-lg px-4 py-3 text-white">
        <h1 className="text-2xl font-bold text-center mb-8 mt-2">Manage Your Todos</h1>
        <div className="mb-4">
          <TodoForm addTodo={addTodo} />
        </div>
        <div className="flex flex-wrap gap-y-3">
          {todos.map((todo, index) => (
           <TodoItem key={index} todo={todo} onDelete={onDelete} onUpdate={onUpdate} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
