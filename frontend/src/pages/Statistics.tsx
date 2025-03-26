import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  CircularProgress, 
  Alert, 
  Grid, 
  Card, 
  CardContent,
  LinearProgress,
  Divider,
  alpha,
  useTheme
} from '@mui/material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { getTasks } from '../services/taskService';
import { Task, TaskStatus } from '../types/task';

interface StatusCount {
  name: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

const Statistics: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const theme = useTheme();

  // Define status colors using useMemo to prevent recreation on every render
  const statusColors = useMemo(() => ({
    todo: theme.palette.info.main, // Blue
    inProgress: theme.palette.warning.main, // Orange
    completed: theme.palette.success.main, // Green  
  }), [theme.palette.info.main, theme.palette.warning.main, theme.palette.success.main]);

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

  // Use useMemo to calculate statusData instead of using a state and useEffect
  const statusData = useMemo<StatusCount[]>(() => {
    if (tasks.length === 0) return [];
    
    // Count tasks by status
    const statusCounts: Record<TaskStatus, number> = {
      [TaskStatus.TODO]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.COMPLETED]: 0,
    };

    tasks.forEach(task => {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    });

    // Format data for the charts
    return [
      { 
        name: 'To Do', 
        value: statusCounts[TaskStatus.TODO], 
        color: statusColors.todo,
        icon: <HourglassEmptyIcon />
      },
      { 
        name: 'In Progress', 
        value: statusCounts[TaskStatus.IN_PROGRESS], 
        color: statusColors.inProgress,
        icon: <TrendingUpIcon />
      },
      { 
        name: 'Completed', 
        value: statusCounts[TaskStatus.COMPLETED], 
        color: statusColors.completed,
        icon: <CheckCircleIcon />
      }
    ];
  }, [tasks, statusColors]);

  // Use useMemo for completion rate calculation
  const completionRate = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
    return Math.round((completedTasks / tasks.length) * 100);
  }, [tasks]);

  // Memoize the getProgressColor function
  const getProgressColor = useMemo(() => {
    return (rate: number) => {
      if (rate < 30) return statusColors.todo;
      if (rate < 70) return statusColors.inProgress;
      return statusColors.completed;
    };
  }, [statusColors]);

  const renderStatCard = (title: string, value: number, icon: React.ReactNode, color: string) => (
    <Card 
      sx={{ 
        height: '100%',
        boxShadow: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        borderRadius: 2,
        borderLeft: `4px solid ${color}`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Box 
            sx={{ 
              mr: 2, 
              p: 1.5, 
              borderRadius: 2, 
              backgroundColor: alpha(color, 0.1),
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" color="text.secondary" fontWeight="medium">
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" component="div" fontWeight="bold">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        Task Statistics
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : tasks.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          You don't have any tasks yet. Create some tasks to see statistics!
        </Alert>
      ) : (
        <>
          {/* Overview Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6} lg={3}>
              {renderStatCard(
                'Total Tasks', 
                tasks.length, 
                <AssignmentIcon />, 
                theme.palette.primary.main
              )}
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              {renderStatCard(
                'To Do', 
                statusData.find(d => d.name === 'To Do')?.value || 0, 
                <HourglassEmptyIcon />, 
                statusColors.todo
              )}
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              {renderStatCard(
                'In Progress', 
                statusData.find(d => d.name === 'In Progress')?.value || 0, 
                <TrendingUpIcon />, 
                statusColors.inProgress
              )}
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              {renderStatCard(
                'Completed', 
                statusData.find(d => d.name === 'Completed')?.value || 0, 
                <CheckCircleIcon />, 
                statusColors.completed
              )}
            </Grid>
          </Grid>
          
          {/* Progress Card */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2, 
              boxShadow: 2,
              backgroundColor: alpha(getProgressColor(completionRate), 0.03),
              border: `1px solid ${alpha(getProgressColor(completionRate), 0.2)}`,
            }}
          >
            <Box display="flex" alignItems="center" mb={1}>
              <PlaylistAddCheckIcon sx={{ mr: 1, color: getProgressColor(completionRate) }} />
              <Typography variant="h6" gutterBottom fontWeight="medium">
                Overall Progress
              </Typography>
            </Box>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box px={1}>
                  <LinearProgress 
                    variant="determinate" 
                    value={completionRate} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      backgroundColor: alpha(getProgressColor(completionRate), 0.2),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getProgressColor(completionRate),
                      }
                    }} 
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h4" color="text.secondary" fontWeight="bold" textAlign={{ xs: 'left', md: 'right' }}>
                  {completionRate}% Complete
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Charts */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  height: '100%', 
                  borderRadius: 2,
                  boxShadow: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  Task Status Distribution
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        innerRadius={60}
                        paddingAngle={3}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => 
                          percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                        }
                      >
                        {statusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                            stroke={theme.palette.background.paper}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} tasks`, 'Count']}
                        contentStyle={{
                          borderRadius: 8,
                          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
                          border: 'none'
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        align="center"
                        iconType="circle"
                        iconSize={10}
                        wrapperStyle={{ paddingTop: 20 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  borderRadius: 2,
                  boxShadow: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  Task Status Comparison
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={statusData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: theme.palette.text.secondary }} 
                        axisLine={{ stroke: alpha(theme.palette.text.primary, 0.2) }}
                      />
                      <YAxis 
                        tick={{ fill: theme.palette.text.secondary }} 
                        axisLine={{ stroke: alpha(theme.palette.text.primary, 0.2) }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} tasks`, 'Count']}
                        contentStyle={{
                          borderRadius: 8,
                          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
                          border: 'none'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        name="Tasks"
                        radius={[4, 4, 0, 0]}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default Statistics; 