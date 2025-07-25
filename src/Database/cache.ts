import { contentSchema } from '@/models/content.model';
import { createClient, SCHEMA_FIELD_TYPE, SCHEMA_VECTOR_FIELD_ALGORITHM } from 'redis';
import { json } from 'stream/consumers';
import { v4 as uuidv4 } from 'uuid';

const client = createClient();
client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

async function CreateRedisIndex(){
    try { 
        await client.ft.create('vector_idx', {
           '$.sourceType': { type: SCHEMA_FIELD_TYPE.TEXT, AS: 'sourceType' },
           '$.title': { type: SCHEMA_FIELD_TYPE.TEXT, AS: 'title' },
           '$.text': { type: SCHEMA_FIELD_TYPE.TEXT, AS: 'text' },
           // Metadata: static
           '$.metadata.static.fileName': { type: SCHEMA_FIELD_TYPE.TEXT, AS: 'metadata.static.fileName' },
           '$.metadata.static.pageNumber': { type: SCHEMA_FIELD_TYPE.NUMERIC, AS: 'metadata.static.pageNumber' },
           '$.metadata.static.segment.segment_id': { type: SCHEMA_FIELD_TYPE.NUMERIC, AS: 'metadata.static.segment.segment_id' },
           '$.metadata.static.segment.segment_start': { type: SCHEMA_FIELD_TYPE.NUMERIC, AS: 'metadata.static.segment.segment_start' },
           '$.metadata.static.segment.segment_end': { type: SCHEMA_FIELD_TYPE.NUMERIC, AS: 'metadata.static.segment.segment_end' },
           // $.Metadata: web
           '$.metadata.web.url': { type: SCHEMA_FIELD_TYPE.TEXT, AS: 'metadata.web.url' },
           '$.metadata.web.snippet': { type: SCHEMA_FIELD_TYPE.TEXT, AS: 'metadata.web.snippet' },
           '$.metadata.web.fetchedAt': { type: SCHEMA_FIELD_TYPE.TEXT, AS: 'metadata.web.fetchedAt' },
           '$.metadata.web.segment.segment_id': { type: SCHEMA_FIELD_TYPE.NUMERIC, AS: 'metadata.web.segment.segment_id' },
           '$.metadata.web.segment.segment_start': { type: SCHEMA_FIELD_TYPE.NUMERIC, AS: 'metadata.web.segment.segment_start' },
           '$.metadata.web.segment.segment_end': { type: SCHEMA_FIELD_TYPE.NUMERIC, AS: 'metadata.web.segment.segment_end' },
           // Embedding
           '$.embedding': {
               type: SCHEMA_FIELD_TYPE.VECTOR,
               TYPE: 'FLOAT32',
               ALGORITHM: SCHEMA_VECTOR_FIELD_ALGORITHM.HNSW,
               DISTANCE_METRIC: 'L2',
               DIM: 1024,
               AS: 'embedding'
           }
        }, {
            ON: 'JSON',
            PREFIX: 'jdoc:' // <-- changed to match your key prefix
        });
    } catch (e:any) {
        console.log('Vector Index cannot be created in redis',e)
        throw new Error(e)
    }
}
// CreateRedisIndex()


export async function AddRedis(docs: contentSchema[]) {
    try {
        console.log('Docs to insert:', docs.length);
        await Promise.all(
            docs.map(async (doc) => {
                try {
                    // Generate a random unique key using uuid
                    const id = uuidv4();
                    const key = `jdoc:${id}`;
                    const value = typeof doc.toObject === 'function' ? doc.toObject() : JSON.parse(JSON.stringify(doc));
                    await client.json.set(key, '$', value);
                    console.log(`Inserted: ${key}`);
                    await client.expire(key, 600);
                } catch (err) {
                    console.error('Error inserting doc:', err);
                }
            })
        );
        console.log('Insertion and expiration complete');
    } catch (error: any) {
        console.log('Error in inserting redis:', error);
        throw new Error(error);
    }
    return;
}

export async function SearchRedis(queryEmbeddig:number[]){
    const embeddingBuffer = Buffer.from(new Float32Array(queryEmbeddig).buffer);
    try {
        const jsons = await client.ft.search(
            'vector_idx',
            '*=>[KNN 3 @embedding $B AS score]',
            {
                PARAMS: { B: embeddingBuffer },
                RETURN: ['score', 'title', 'text'], // Use fields that exist in your schema
                DIALECT: 2
            },
        );
        console.log(jsons)
        return jsons;
    } catch (e) {
        console.error('Redis search error:', e);
        throw e;
    }
}

