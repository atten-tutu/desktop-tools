import express from 'express';
import type { Request, Response } from 'express';
import { Server as HttpServer } from 'http';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { networkInterfaces } from 'os';

/**
 * LAN 共享服务器类
 * 提供局域网文件共享功能
 */
export class LanShareServer {
  private app: express.Application;
  private server: HttpServer | null = null;
  private port: number = 3000;
  private savePath: string = '';
  private isRunning: boolean = false;
  private deviceName: string = ''; // 设备名称

  constructor() {
    this.app = express();
    
    // 启用 CORS
    this.app.use(cors({
      origin: '*', // 允许所有来源
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    // 配置基本中间件
    this.app.use(express.json());
    
    // 配置健康检查端点
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ 
        status: 'ok',
        serverTime: new Date().toISOString(),
        version: '1.0.0'
      });
    });
    
    // 添加测试端点
    this.app.get('/test', (req: Request, res: Response) => {
      res.status(200).json({
        message: 'Test endpoint is working',
        ip: this.getLocalIpAddress(),
        port: this.port,
        time: new Date().toISOString()
      });
    });
  }

  /**
   * 配置文件上传功能
   */
  private configureFileUpload(): void {
    if (!this.savePath) {
      console.warn('Save path not set, file upload disabled');
      return;
    }

    // 确保保存路径存在
    if (!fs.existsSync(this.savePath)) {
      fs.mkdirSync(this.savePath, { recursive: true });
    }

    // 配置文件存储
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.savePath);
      },
      filename: (req, file, cb) => {
        // 生成唯一文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
      }
    });

    // 创建 multer 实例
    const upload = multer({ 
      storage,
      limits: { fileSize: 1024 * 1024 * 500 } // 500MB 限制
    });

    // 文件上传端点
    this.app.post('/upload', upload.single('file'), (req: Request, res: Response) => {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      // 返回文件信息
      res.status(200).json({
        success: true,
        file: {
          originalName: req.file.originalname,
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size,
          url: `http://${this.getLocalIpAddress()}:${this.port}/files/${req.file.filename}`
        }
      });
    });
  }

  /**
   * 获取本机 IP 地址
   */
  private getLocalIpAddress(): string {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      const net = nets[name];
      if (net) {
        for (const netInterface of net) {
          // 跳过内部 IP 和非 IPv4 地址
          if (netInterface.family === 'IPv4' && !netInterface.internal) {
            return netInterface.address;
          }
        }
      }
    }
    return 'localhost';
  }

  /**
   * 设置服务器端口
   * @param port 端口号
   */
  public setPort(port: number): void {
    this.port = port;
  }

  /**
   * 设置设备名称
   * @param name 设备名称
   */
  public setDeviceName(name: string): void {
    this.deviceName = name;
  }

  /**
   * 设置文件保存路径
   * @param savePath 保存路径
   */
  public setSavePath(savePath: string): void {
    this.savePath = savePath;
    
    // 确保保存路径存在
    if (savePath && !fs.existsSync(savePath)) {
      fs.mkdirSync(savePath, { recursive: true });
    }
    
    // 如果服务器已运行，更新静态文件服务
    if (this.isRunning && savePath) {
      this.app.use('/files', express.static(savePath));
    }
  }

  /**
   * 启动服务器
   * @returns 是否成功启动
   */
  public async start(): Promise<boolean> {
    if (this.isRunning) {
      console.log('Server is already running');
      return true;
    }
    
    try {
      // 配置文件上传功能
      this.configureFileUpload();
      
      // 如果保存路径已设置，配置静态文件服务
      if (this.savePath) {
        this.app.use('/files', express.static(this.savePath));
      }
      
      // 创建 HTTP 服务器
      this.server = new HttpServer(this.app);
      
      // 启动服务器
      return new Promise((resolve) => {
        this.server?.listen(this.port, '0.0.0.0', () => {
          console.log(`LAN Share server running on port ${this.port}, bound to 0.0.0.0`);
          this.isRunning = true;
          
          // 打印服务器信息
          const ip = this.getLocalIpAddress();
          console.log(`Server accessible at: http://${ip}:${this.port}/`);
          console.log(`Test endpoint: http://${ip}:${this.port}/test`);
          
          resolve(true);
        });
      });
    } catch (error) {
      console.error('Failed to start LAN Share server:', error);
      this.isRunning = false;
      return false;
    }
  }

  /**
   * 停止服务器
   * @returns 是否成功停止
   */
  public async stop(): Promise<boolean> {
    if (!this.isRunning || !this.server) {
      console.log('Server is not running');
      return true;
    }
    
    return new Promise((resolve) => {
      this.server?.close(() => {
        console.log('LAN Share server stopped');
        this.isRunning = false;
        this.server = null;
        resolve(true);
      });
    });
  }

  /**
   * 获取服务器运行状态
   * @returns 服务器是否正在运行
   */
  public isServiceRunning(): boolean {
    return this.isRunning;
  }

  /**
   * 获取服务器 URL
   * @returns 服务器 URL
   */
  public getServerUrl(): string {
    if (!this.isRunning) {
      return '';
    }
    
    const ip = this.getLocalIpAddress();
    return `http://${ip}:${this.port}`;
  }

  /**
   * 获取已上传文件列表
   * @param dirPath 目录路径
   * @returns 文件列表信息
   */
  public getFileList(dirPath: string): { success: boolean; files: any[]; error?: string } {
    try {
      if (!fs.existsSync(dirPath)) {
        return { success: false, error: 'Directory does not exist', files: [] };
      }
      
      const files = fs.readdirSync(dirPath)
        .filter(file => fs.statSync(path.join(dirPath, file)).isFile())
        .map(file => {
          const filePath = path.join(dirPath, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            size: stats.size,
            lastModified: stats.mtime.toISOString()
          };
        });
      
      return { success: true, files };
    } catch (error) {
      console.error('Failed to get file list:', error);
      return { success: false, error: String(error), files: [] };
    }
  }
} 