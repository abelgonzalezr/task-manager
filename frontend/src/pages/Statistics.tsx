import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, CircularProgress, Alert } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getTasks } from '../services/taskService';
import { Task, TaskStatus } from '../types/task';

interface StatusCount {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#0088FE', '#FFBB28', '#00C49F'];

const Statistics: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [statusData, setStatusData] = useState<StatusCount[]>([]);

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
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      // Count tasks by status
      const statusCounts: Record<TaskStatus, number> = {
        [TaskStatus.TODO]: 0,
        [TaskStatus.IN_PROGRESS]: 0,
        [TaskStatus.COMPLETED]: 0,
      };

      tasks.forEach(task => {
        statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
      });

      // Format data for the pie chart
      const chartData: StatusCount[] = [
        { 
          name: 'To Do', 
          value: statusCounts[TaskStatus.TODO], 
          color: COLORS[0] 
        },
        { 
          name: 'In Progress', 
          value: statusCounts[TaskStatus.IN_PROGRESS], 
          color: COLORS[1] 
        },
        { 
          name: 'Completed', 
          value: statusCounts[TaskStatus.COMPLETED], 
          color: COLORS[2] 
        }
      ];

      setStatusData(chartData);
    }
  }, [tasks]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Task Statistics
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : tasks.length === 0 ? (
        <Alert severity="info">You don't have any tasks yet. Create some tasks to see statistics!</Alert>
      ) : (
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Task Status Distribution
          </Typography>
          
          <Box height={400}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          
          <Box mt={3}>
            <Typography variant="body1">
              Total Tasks: {tasks.length}
            </Typography>
            <Typography variant="body1">
              To Do: {statusData.find(d => d.name === 'To Do')?.value || 0} tasks
            </Typography>
            <Typography variant="body1">
              In Progress: {statusData.find(d => d.name === 'In Progress')?.value || 0} tasks
            </Typography>
            <Typography variant="body1">
              Completed: {statusData.find(d => d.name === 'Completed')?.value || 0} tasks
            </Typography>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default Statistics; 