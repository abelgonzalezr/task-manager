import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, Box, MenuItem, Select, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Chip, SelectChangeEvent } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Task, TaskStatus } from '../types/task';
import { updateTask, deleteTask } from '../services/taskService';

interface TaskCardProps {
  task: Task;
  onTaskUpdate: () => void;
  onTaskDelete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskUpdate, onTaskDelete }) => {
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'info';
      case TaskStatus.IN_PROGRESS:
        return 'warning';
      case TaskStatus.COMPLETED:
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'To Do';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.COMPLETED:
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const handleStatusChange = async (event: SelectChangeEvent) => {
    const newStatus = event.target.value as TaskStatus;
    setStatus(newStatus);
    
    try {
      await updateTask(task.id, { status: newStatus });
      onTaskUpdate();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTask(task.id);
      setOpenDeleteDialog(false);
      onTaskDelete();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  return (
    <>
      <Card sx={{ mb: 2, boxShadow: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" component="div">
              {task.title}
            </Typography>
            <Chip 
              label={getStatusLabel(task.status)} 
              color={getStatusColor(task.status) as any} 
              size="small" 
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {task.description}
          </Typography>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Select
              value={status}
              onChange={handleStatusChange}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value={TaskStatus.TODO}>To Do</MenuItem>
              <MenuItem value={TaskStatus.IN_PROGRESS}>In Progress</MenuItem>
              <MenuItem value={TaskStatus.COMPLETED}>Completed</MenuItem>
            </Select>
            
            <Box>
              <Button 
                startIcon={<DeleteIcon />} 
                color="error" 
                onClick={handleDeleteClick}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the task "{task.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TaskCard; 