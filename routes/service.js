const express = require("express");
const { IncomingForm } = require("formidable");
const fs = require("fs");
const prisma = require("../lib/prisma");
const router = express.Router();

var AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.IAM_USER_KEY,
  secretAccessKey: process.env.IAM_USER_SECRET,
  Bucket: process.env.BUCKET_NAME,
});

var awsImagePath = [];

const readFile = async (file) => {
  const photo = await fs.promises.readFile(file.path).catch((err) => {
    console.error("Failed to read file", err);
  });
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: file.name,
    ContentType: file.type,
    Body: photo,
    ACL: "public-read",
  };

  try {
    let uploadRes = s3.upload(params).promise();
    let resData = await uploadRes;
    awsImagePath.push(resData.Location);
  } catch (error) {
    return error;
  }
};

const uploadPhototToawsS3 = async (data) => {
  const images = data.files.images;
  if (Array.isArray(images)) {
    const promises = images.map((item) => readFile(item));
    await Promise.all(promises);
    return { message: "success" };
  } else {
    readFile(images);
    return { message: "success" };
  }
};

router.post("/", async (req, res, next) => {
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.multiples = true;
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  if (Object.keys(data.files).length !== 0) {
    try {
      uploadPhototToawsS3(data).then(async (pres) => {
        if (pres.message === "success") {
          await prisma.services.create({
            data: {
              serviceName: data.fields.service_name,
              slug: data.fields.slug,
              images: awsImagePath,
              description: data.fields.description,
              subCategories: JSON.parse(data.fields.sub_category),
              serviceFee: Number(data.fields.service_fee),
              saleFee: Number(data.fields.sale_fee),
              discount: Number(data.fields.discount),
              gst: Number(data.fields.gst),
              usage: data.fields.usage,
              status: JSON.parse(data.fields.status),
              category: { connect: { name: data.fields.category } },
            },
          });
          res.status(200).json({
            msg: "success",
          });
        }
      });
    } catch (error) {
      console.log(error);
      return next(error);
    } finally {
      async () => {
        await prisma.$disconnect();
      };
    }
  } else {
    try {
      await prisma.services.create({
        data: {
          serviceName: data.fields.service_name,
          slug: data.fields.slug,
          description: data.fields.description,
          subCategories: JSON.parse(data.fields.sub_category),
          serviceFee: Number(data.fields.service_fee),
          saleFee: Number(data.fields.sale_fee),
          discount: Number(data.fields.discount),
          gst: Number(data.fields.gst),
          usage: data.fields.usage,
          status: JSON.parse(data.fields.status),
          category: { connect: { name: data.fields.category } },
        },
      });

      res.status(200).json({
        msg: "success",
      });
    } catch (error) {
      console.log(error);
      return next(error);
    } finally {
      async () => {
        await prisma.$disconnect();
      };
    }
  }
});

router.post("/:id", async (req, res, next) => {
  const serviceId = req.params.id;
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  if (Object.keys(data.files).length !== 0) {
    uploadPhototToawsS3(data)
      .then(async (pres) => {
        if (pres.message === "success") {
          try {
            await prisma.services.update({
              where: { id: Number(serviceId) },
              data: {
                serviceName: data.fields.service_name,
                slug: data.fields.slug,
                images: awsImagePath,
                description: data.fields.description,
                category: { connect: { name: data.fields.category } },
                subCategories: JSON.parse(data.fields.sub_category),
                serviceFee: Number(data.fields.service_fee),
                saleFee: Number(data.fields.sale_fee),
                discount: Number(data.fields.discount),
                gst: Number(data.fields.gst),
                usage: data.fields.usage,
                status: JSON.parse(data.fields.status),
              },
            });

            res.status(200).json({
              msg: "success",
            });
          } catch (error) {
            console.log(error);
            return next(error);
          } finally {
            async () => {
              await prisma.$disconnect();
            };
          }
        }
      })
      .catch((error) => console.log(error));
  } else {
    try {
      await prisma.services.update({
        where: { id: Number(serviceId) },
        data: {
          serviceName: data.fields.service_name,
          slug: data.fields.slug,
          description: data.fields.description,
          category: { connect: { name: data.fields.category } },
          subCategories: JSON.parse(data.fields.sub_category),
          serviceFee: Number(data.fields.service_fee),
          saleFee: Number(data.fields.sale_fee),
          discount: Number(data.fields.discount),
          gst: Number(data.fields.gst),
          usage: data.fields.usage,
          status: JSON.parse(data.fields.status),
        },
      });
      res.status(200).json({
        msg: "success",
      });
    } catch (error) {
      console.log(error);
      return next(error);
    } finally {
      async () => {
        await prisma.$disconnect();
      };
    }
  }
});

module.exports = router;
