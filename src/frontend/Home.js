import React, { useState, useEffect } from 'react';
import TodoForm from './TodoForm';
import TodoItem from './TodoItem'; // Import the TodoItem component

const Home = () => {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetchTasks(); // Fetch todos on component mount
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:8000/tasks', {
        method: 'GET',
        credentials: 'include', // Include credentials for authentication
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTodos(data); // Set todos from the response
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const addTasks = async (todoText) => {
    try {
        const response = await fetch('http://localhost:8000/saveTasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ todoText }),
          credentials: 'include',
        });
  
        if (!response.ok) {
          throw new Error('Failed to save tasks');
        }
        
        await fetchTasks();
        // Clear the input field after submission
      } catch (error) {
        console.error('Error saving tasks:', error);
      }
   
  };


  const onUpdated = async (todoId, newText) => {
    try {
      const response = await fetch('http://localhost:8000/updateTasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ todoId, newText }),
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error('Failed to update tasks');
      }
      
      await fetchTasks();
      
        window.location.reload();
      
    } catch (error) {
      console.error('Error updating tasks:', error);
    }

  };

  

const onDeleted = async (todoId) => {
    try {
      const response = await fetch('http://localhost:8000/deleteTasks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ todoId }), // Send the todo ID in the request body
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tasks');
      }
      
      await fetchTasks();
     
    } catch (error) {
      console.error('Error deleting tasks:', error);
    }
  };



  return (
    <div className="bg-[#172842] min-h-screen py-8">
      <div className="w-full max-w-2xl mx-auto shadow-md rounded-lg px-4 py-3 text-white">
        <h1 className="text-2xl font-bold text-center mb-8 mt-2">Manage Your Todos</h1>
        <div className="mb-4">
          <TodoForm addTasks={addTasks} />
        </div>
        <div className="flex flex-wrap gap-y-3">
          {todos.map((todo, index) => (
           <TodoItem key={index} todo={todo} onDelete={onDeleted} onUpdate={onUpdated} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
