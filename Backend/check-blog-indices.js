const { BlogPost, sequelize } = require('./src/models');

async function checkIndices() {
    try {
        const [results] = await sequelize.query("SHOW INDEX FROM blog_posts");
        console.log("Current indices on blog_posts:");
        results.forEach(index => {
            console.log(`- ${index.Key_name} (${index.Column_name})`);
        });
        
        const count = results.length;
        console.log(`Total indices: ${count}`);
        
        if (count > 60) {
            console.log("\nWARNING: Too many indices! You are near or at the limit of 64.");
            console.log("Sequelize might be creating redundant unique indices if 'alter: true' is being used and it's failing to recognize existing ones.");
        }
        
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkIndices();
