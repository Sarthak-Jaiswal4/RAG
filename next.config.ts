import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
},
};

module.exports={
  env:{
    MONGO_URL:"mongodb+srv://sarthakjazz8:DKYDyRz6DeEPJVHb@cluster-1.qfxfo.mongodb.net/RAG?retryWrites=true&w=majority&appName=Cluster-1",
    GOOGLE_API_KEY:"AIzaSyAJvsfOJfNBuDh4S4JedmEUiNRTzHKMHII",
    COHERE_API_KEY:"cEXk8XayVz2a69OHN820foAKTVi84ZB4jBKKBjz9",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:'pk_test_bXVzaWNhbC1jYWxmLTQ2LmNsZXJrLmFjY291bnRzLmRldiQ',
    CLERK_SECRET_KEY:'sk_test_j9AM8Z2FfsrE8I7WuHhn5cXqH5zohZB08GvU2W0gig',
    WEB_HOOK_KEY:"whsec_VzHZOl5Nu6V2CRB5FueYAYQUVMFZv8Zn"
  }
}

export default nextConfig;
