import { Elysia, t } from 'elysia';
import { supabase } from './libs/supabase';
import { treaty } from '@elysiajs/eden';
import { v4 as uuidv4 } from 'uuid';

const app = new Elysia()
  .post(
    '/image',
    async ({ body: { image } }) => {
      console.time('Total Upload Time');

      if (!image || image.length === 0) {
        console.error('No image uploaded.');
        console.timeEnd('Total Upload Time');
        return { status: 400, message: 'No image uploaded.' };
      }

      const imageUrls = [];
      const images = Array.isArray(image) ? image : [image];

      for (const img of images) {
        if (!img.type.startsWith('image/')) {
          console.error('Invalid file type:', img.type);
          console.timeEnd('Total Upload Time');
          return { status: 400, message: 'Invalid file type. Only images are allowed.' };
        }

        console.time('File Processing Time');
        const fileData = new Uint8Array(await img.arrayBuffer());
        const uniqueId = uuidv4();
        const fileName = `${uniqueId}.${img.name.split('.').pop() || 'jpg'}`;
        console.timeEnd('File Processing Time');

        console.time('Supabase Upload Time');
        const { data, error } = await supabase.storage
          .from('KidneyCare')
          .upload(`pills/${fileName}`, fileData, {
            cacheControl: '3600',
            upsert: false,
            contentType: img.type,
          });
        console.timeEnd('Supabase Upload Time');

        if (error) {
          console.error('Error uploading to Supabase:', error.message);
          console.timeEnd('Total Upload Time');
          return { status: 500, message: 'Error uploading file to Supabase.', error };
        }

        console.log(`File uploaded to Supabase: ${fileName}`);
        const baseUrl = 'https://tnkoeqhohpakpspbbwgr.supabase.co/storage/v1/object/public/KidneyCare/';
        const imageUrl = `${baseUrl}${data.path}`;
        console.log(`Public URL: ${imageUrl}`);

        imageUrls.push(imageUrl);
      }

      console.timeEnd('Total Upload Time');
      return {
        status: 200,
        message: 'Files uploaded successfully',
        imageUrls,
      };
    },
    {
      body: t.Object({
        image: t.Union([t.File(), t.Array(t.File())]),
      }),
    }
  )
  .get('/', () => {
    return 'hello kidneycare-supabase';
  })
  .listen(3002);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export const api = treaty<typeof app>('localhost:3002');
