import prisma from '../utils/prisma'
import { Response } from 'express'
import { AuthRequest as Request } from '../middlewares/auth.middleware'

export const add = async (req: Request, res: Response)=>{
    try{

        const { title, description, status} = req.body;

        
        const task = await prisma.task.create({
            data: { title,description, status, userId: req.userId! }
        })

        res.status(201).json({
            task: {id: task.id, title: task.title, description: task.description, status: task.status  }
        })

    } catch(error){
        res.status(500).json({message: "Internal Server error"})
    }
}

export const getAll = async (req: Request, res: Response) => {
  try {
    const { status, search, page = '1', limit = '10' } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const tasks = await prisma.task.findMany({
      where: {
        userId: req.userId!,
        ...(status && { status: status as any }),
        ...(search && {
          title: {
            contains: search as string,
            mode: 'insensitive'
          }
        })
      },
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' }
    })

    const total = await prisma.task.count({
      where: { userId: req.userId! }
    })

    res.status(200).json({
      tasks,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    })

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getOne = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id as string); // Assert as string to fix type error

    if (isNaN(taskId)) {
      res.status(400).json({ message: 'Invalid task ID' });
      return;
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: req.userId!,
      },
    });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.status(200).json({ task });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status  } = req.body;
    const taskId = parseInt(id as string); // Assert as string to fix type error

    if (isNaN(taskId)) {
      res.status(400).json({ message: 'Invalid task ID' });
      return;
    }

    const task = await prisma.task.update({
      data: {title, description, status},
      where: {id:taskId, userId: req.userId!}
    })

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.status(200).json({ task });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const taskId = parseInt(id as string); // Assert as string to fix type error

    if (isNaN(taskId)) {
      res.status(400).json({ message: 'Invalid task ID' });
      return;
    }

    const task = await prisma.task.delete({
      
      where: {id:taskId, userId: req.userId!}
    })


    res.status(200).json({ message: "task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const toggle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
   
    const taskId = parseInt(id as string); // Assert as string to fix type error

    if (isNaN(taskId)) {
      res.status(400).json({ message: 'Invalid task ID' });
      return;
    }

    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId: req.userId!}
    })

    if(!existingTask){
      res.status(404).json({message:"Task not found"})
      return
    }

    const newStatus = existingTask?.status === "COMPLETED" ? "PENDING" : "COMPLETED"

    const task = await prisma.task.update({
      where: {id:taskId, userId: req.userId!},
      data: {status: newStatus}
    })
    res.status(201).json({newStatus})
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};