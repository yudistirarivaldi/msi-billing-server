async update(req: Request, res: Response) {
    const { id } = req.params;
    const userLogin = req.user as jwtPayloadInterface;
    if (isNaN(Number(id))) {
      return ResponseData.badRequest(res, "Invalid ID parameter");
    }

    if (req.body.clientId === "" || req.body.clientId === "null") {
      req.body.clientId = null;
    }

    if (req.body.productId === "" || req.body.productId === "null") {
      req.body.productId = null;
    }

    if (req.body.provinceId === "" || req.body.provinceId === "null") {
      req.body.provinceId = null;
    }

    const validateResult = validateInput(schema, req.body);

    if (!validateResult.success) {
      return ResponseData.validateError(res, validateResult.errors);
    }
    const body = validateResult.data!;

    try {
      const cekData = await prisma.portfolio.findUnique({
        where: {
          id: Number(id),
        },
      });
      if (!cekData) {
        return ResponseData.notFound(res, "Portfolio not found");
      }

      const isTitleChanged = body.title && body.title.trim() !== (cekData.title || "").trim();

      if (isTitleChanged) {
        const cekUnique = await prisma.portfolio.findFirst({
          where: {
            title: body.title.trim(),
            id: {
              not: Number(id),
            },
          },
        });
        
        if (cekUnique) {
          return ResponseData.badRequest(res, "Portfolio already exists");
        }
      }

      const logo = await handleUpload(
        req,
        "logo",
        "portfolio",
        ["image/gif", "image/jpeg", "image/jpg", "image/png", "image/webp"],
        {
          isRequired: false,
        },
      );

      const image = await handleUpload(
        req,
        "image",
        "portfolio",
        ["image/gif", "image/jpeg", "image/jpg", "image/png", "image/webp"],
        {
          isRequired: false,
        },
      );

      const dokumentasi = await handleUpload(
        req,
        "dokumentasi",
        "portfolio",
        ["image/gif", "image/jpeg", "image/jpg", "image/png", "image/webp"],
        {
          isRequired: false,
          uploadMultiple: true,
        },
      );

      
      let slug = cekData.slug;

      if (body.slug) {
        slug = await generateUniqueSlug("portfolio", body.slug);
      } else if (isTitleChanged && body.title) {
        slug = await generateUniqueSlug("portfolio", body.title);
      }

      if (logo && cekData.logo) {
        await deleteFileFromS3(cekData.logo);
      }

      if (image && cekData.image) {
        await deleteFileFromS3(cekData.image);
      }

      if (dokumentasi && cekData.dokumentasi) {
        for (const file of cekData.dokumentasi) {
          await deleteFileFromS3(file);
        }
      }

      const data = await prisma.portfolio.update({
        where: {
          id: Number(id),
        },
        data: {
          title: body.title,
          slug,
          institute: body.institute,
          year: body.year,
          excerpt: body.excerpt,
          desc: body.desc,
          linkWeb: body.linkWeb,
          linkApp: body.linkApp,
          altImage: body.altImage,
          keyword: body.keyword,
          ...(logo && { logo }),
          ...(image && { image }),
          portfolioCategory: body.portfolioCategory as ServiceType,
          technology: {
            set: body.technologyId.map((id) => ({ id })),
          },
          dokumentasi: dokumentasi || cekData.dokumentasi,
          productId: body.productId && !isNaN(Number(body.productId)) ? Number(body.productId) : null,
          provinceId: body.provinceId && !isNaN(Number(body.provinceId)) ? Number(body.provinceId) : null,
          clientId: body.clientId && !isNaN(Number(body.clientId)) ? Number(body.clientId) : null,
        },
      });

      await prisma.portfolioTagRelation.deleteMany({
        where: {
          portfolioId: data.id,
          portfolioTagId: {
            notIn: body.portfolioTag.map((tag) => Number(tag)),
          },
        },
      });

      await prisma.portfolioTagRelation.createMany({
        data: body.portfolioTag.map((tag) => ({
          portfolioId: data.id,
          portfolioTagId: Number(tag),
        })),
        skipDuplicates: true,
      });

      await logActivity(
        userLogin.id,
        "UPDATE",
        `Update Portfolio dengan nama : ${data.title}`,
      );
      return ResponseData.ok(res, data);
    } catch (error) {
      return ResponseData.serverError(res, error);
    }
  },