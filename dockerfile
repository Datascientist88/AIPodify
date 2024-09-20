# Step 1: Use an official Nginx image from Docker Hub as the base image
FROM nginx:alpine

# Step 2: Remove the default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Step 3: Copy your static files into the Nginx directory
COPY . /usr/share/nginx/html

# Step 4: Expose port 80 to serve the website
EXPOSE 80

# Step 5: Start Nginx server when the container starts
CMD ["nginx", "-g", "daemon off;"]
