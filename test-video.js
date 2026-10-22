import "dotenv/config";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ forcePathStyle: true });
const bucket = "videos"; // Your Neon bucket name

// List all your video filenames here
const videoFiles = [
  "hit.mp4",
  "airdrop.mp4",
  "new-m.mp4"
];

async function generateAllLinks() {
  try {
    console.log("Generating secure viewing links for all videos...\n");
    
    for (const key of videoFiles) {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      
      // Generates a separate temporary secure link valid for 1 hour
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      
      console.log(`---------------------------------------------------`);
      console.log(`FILE: ${key}`);
      console.log(url);
      console.log(`---------------------------------------------------\n`);
    }
  } catch (error) {
    console.error("Error generating links:", error.message);
  }
}

generateAllLinks();