import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, CircularProgress, Alert } from '@mui/material';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { Task } from '../types/task';
import { getTasks } from '../services/taskService';

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const taskData = await getTasks();
        setTasks(taskData);
        setError('');
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [refreshTrigger]);

  const handleTaskCreated = () => {
    // Trigger a refresh of the task list
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTaskUpdate = () => {
    // Trigger a refresh of the task list
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTaskDelete = () => {
    // Trigger a refresh of the task list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Task Manager
      </Typography>
      
      <TaskForm onTaskCreated={handleTaskCreated} />
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : tasks.length === 0 ? (
        <Alert severity="info">You don't have any tasks yet. Create one above!</Alert>
      ) : (
        <Box mt={3}>
          <Typography variant="h5" gutterBottom>
            Your Tasks
          </Typography>
          <Grid container spacing={3}>
            {tasks.map((task) => (
              <Grid item xs={12} md={6} lg={4} key={task.id}>
                <TaskCard 
                  task={task} 
                  onTaskUpdate={handleTaskUpdate} 
                  onTaskDelete={handleTaskDelete}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard; 