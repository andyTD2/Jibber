const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: SECRETS.R2_ACCESS_KEY,
    secretAccessKey: SECRETS.R2_SECRET_ACCESS_KEY,
    endpoint: SECRETS.R2_ENDPOINT,
    region: "auto",
    signatureVersion: 'v4'
});

/*
    Generate a presigned url from our r2 bucket. Anyone with this url can upload to our endpoint.

    filePath (str, required): File path of the uploaded content
    method (str, required): request method, for example: "putObject"
    bucket (str, required): Bucket name
    expiration (int, optional, default: 3): Time in minutes before the url expires.

    returns (str): The presigned url
*/
const generatePresignedUploadURL = async (filePath, method, bucket, expiration = 3) => 
{  

    const signedURL = s3.getSignedUrl(method, {
        Bucket: bucket,
        Key: filePath,
        Expires: expiration,
    });

    return signedURL;
};

/*
    Generate a presigned url from our r2 bucket. Anyone with this url can download from our endpoint.

    filePath (str, required): File path of the content to download
    fileExtension (str, required): File extension of the content to be downloaded.

    returns (str): The presigned url
*/
const generatePresignedDownloadURL = async (filePath, fileExtension) =>
{
    const signedURL = s3.getSignedUrl("getObject", {
        Bucket: SECRETS.R2_BUCKET_NAME,
        Key: filePath,
        Expires: 3600,
        ContentType: `images/${fileExtension}`
    });

    return signedURL;
}


module.exports = {
    generatePresignedUploadURL,
    generatePresignedDownloadURL
}