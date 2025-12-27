import { v2 as cloudinary } from 'cloudinary';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Extract Google Drive file ID from URL
function extractDriveFileId(url) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}

// Download image from Google Drive
async function downloadFromDrive(fileId) {
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    try {
        const response = await fetch(downloadUrl);
        if (!response.ok) {
            throw new Error(`Failed to download: ${response.statusText}`);
        }
        const buffer = await response.buffer();
        return buffer;
    } catch (error) {
        console.error(`Error downloading ${fileId}:`, error.message);
        return null;
    }
}

// Upload to Cloudinary
async function uploadToCloudinary(buffer, unitName) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'cb-tierlist',
                public_id: unitName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                resource_type: 'image',
                transformation: [
                    { width: 320, height: 448, crop: 'fill' }
                ]
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
}

// Main migration function
async function migrateImages() {
    console.log('🚀 Starting migration to Cloudinary...\n');

    // Verify Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error('❌ Error: Cloudinary credentials not found in .env file');
        console.error('Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
        process.exit(1);
    }

    console.log(`✓ Cloudinary configured: ${process.env.CLOUDINARY_CLOUD_NAME}\n`);

    // Load units.json (now it's an array)
    const unitsPath = path.join(__dirname, '..', 'client', 'public', 'data', 'units.json');
    const unitsArray = JSON.parse(await fs.readFile(unitsPath, 'utf-8'));

    // Create backup
    const backupPath = path.join(__dirname, '..', 'client', 'public', 'data', 'units-backup.json');
    await fs.writeFile(backupPath, JSON.stringify(unitsArray, null, 2));
    console.log('✓ Backup created: units-backup.json\n');

    console.log(`Found ${unitsArray.length} units to migrate\n`);

    let successful = 0;
    let failed = 0;
    const failedUnits = [];

    for (let i = 0; i < unitsArray.length; i++) {
        const unit = unitsArray[i];
        const unitName = unit.unit_name;

        console.log(`[${i + 1}/${unitsArray.length}] Processing: ${unitName}`);

        // Skip if already migrated (URL doesn't contain drive.google.com)
        if (!unit.imageUrl || !unit.imageUrl.includes('drive.google.com')) {
            console.log(`  ⏭️  Skipping (already migrated or no URL)\n`);
            continue;
        }

        try {
            // Extract file ID
            const fileId = extractDriveFileId(unit.imageUrl);
            if (!fileId) {
                throw new Error('Could not extract file ID');
            }

            // Download from Drive
            console.log(`  📥 Downloading from Google Drive...`);
            const buffer = await downloadFromDrive(fileId);

            if (!buffer) {
                throw new Error('Failed to download');
            }

            // Upload to Cloudinary
            console.log(`  ☁️  Uploading to Cloudinary...`);
            const result = await uploadToCloudinary(buffer, unitName);

            // Update unit in array
            unit.imageUrl = result.secure_url;

            console.log(`  ✓ Success! URL: ${result.secure_url}\n`);
            successful++;

            // Add small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            console.error(`  ❌ Failed: ${error.message}\n`);
            failed++;
            failedUnits.push(unitName);
        }
    }

    // Save updated units.json
    await fs.writeFile(unitsPath, JSON.stringify(unitsArray, null, 2));

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('Migration Complete!');
    console.log('='.repeat(50));
    console.log(`✓ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    if (failedUnits.length > 0) {
        console.log('\nFailed units:');
        failedUnits.forEach(name => console.log(`  - ${name}`));
    }
    console.log('\n✓ Updated units.json');
    console.log('✓ Backup saved as units-backup.json');
}

// Run migration
migrateImages().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
