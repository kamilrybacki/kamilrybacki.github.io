import { defineCollection, z } from "astro:content";

const articlesCollection = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        description: z.string(),
        image: z.object({
            thumbnail: z.string(),
            hero: z.string(),
            alt: z.string(),
        }),
        date: z.string(),
        tags: z.array(z.string()),
    }),
});

const poemsCollection = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        date: z.string(),
    }),
});

const projectsCollection = defineCollection({
    type: "content",
});

export const collections = {
    articles: articlesCollection,
    poems: poemsCollection,
    projects: projectsCollection,
};
