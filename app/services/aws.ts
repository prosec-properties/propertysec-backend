import { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";

// Ensure environment variables are set
if (!process.env.AWS_CLIENT_ACCESS_KEY || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.AWS_BUCKET) {
  throw new Error("Missing AWS configuration environment variables");
}

// Create S3 instance
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_CLIENT_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

interface File {
  data: Buffer;
  name: string;
}

export const moveToBucket = async (file: File, key: string): Promise<string> => {
  const { data, name } = file;
  const fileName = `${Date.now()}-${name}`;

  console.log("Uploading file to fileName:", fileName);

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET,
    Key: `${key}${fileName}`,
    Body: data,
    ContentType: getContentType(name),
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);
    console.log("File uploaded successfully:", fileName);
    return fileName;
  } catch (err) {
    console.error("Error in uploading file:", err);
    throw err;
  }
};

export const uploadFromUrlToBucket = async (fileUrl: string, key: string): Promise<string> => {
  try {
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const fileName = fileUrl.split("/").pop() || "file";

    const file: File = {
      data: Buffer.from(response.data),
      name: fileName,
    };

    return await moveToBucket(file, key);
  } catch (error) {
    console.error("Error in uploading file from URL:", error);
    throw error;
  }
};

// Function to check if a file exists in S3
export const checkFileExists = async (key: string): Promise<boolean> => {
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: key,
  };

  try {
    const command = new HeadObjectCommand(params);
    await s3.send(command);
    return true;
  } catch (error: any) {
    if (error.name === "NotFound") {
      return false;
    }
    console.error("Error checking file existence:", error);
    throw error;
  }
};

// export const generateSignedUrl = async (key: string): Promise<string> => {
//   const params = {
//     Bucket: process.env.AWS_BUCKET,
//     Key: key,
//   };

//   const command = new GetObjectCommand(params);
//   return getSignedUrl(s3, command, { expiresIn: 3600 }); // URL expires in 1 hour
// };

const getContentType = (filename: string): string => {
  const extension = filename.split(".").pop()?.toLowerCase() || "";

  switch (extension) {
    case "svg":
      return "image/svg+xml";
    case "png":
      return "image/png";
    case "jpeg":
    case "jpg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "avi":
      return "video/x-msvideo";
    case "mpeg":
      return "video/mpeg";
    case "mov":
      return "video/quicktime";
    default:
      return "application/octet-stream";
  }
};