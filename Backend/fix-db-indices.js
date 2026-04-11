const { sequelize } = require('./src/models');

async function fix_indices() {
    try {
        console.log("Checking blog_posts indices...");
        const [indices] = await sequelize.query("SHOW INDEX FROM blog_posts");
        
        // We look for duplicate unique keys for 'slug' or other columns
        // Usually, these are named 'slug', 'slug_2', 'slug_3', etc. 
        // OR 'blog_posts_slug_unique' etc.
        
        const slugIndices = indices.filter(idx => idx.Column_name === 'slug' && idx.Key_name !== 'PRIMARY');
        
        console.log(`Found ${slugIndices.length} slug indices.`);
        
        if (slugIndices.length > 1) {
            console.log("Proceeding to remove redundant indices...");
            
            // Keep the first one, drop others
            // Note: In MySQL, 'DROP INDEX' requires the index name (Key_name)
            for (let i = 1; i < slugIndices.length; i++) {
                const indexName = slugIndices[i].Key_name;
                try {
                    console.log(`Dropping index: ${indexName}`);
                    await sequelize.query(`ALTER TABLE blog_posts DROP INDEX \`${indexName}\``);
                } catch (e) {
                    console.error(`Failed to drop ${indexName}: ${e.message}`);
                }
            }
            console.log("Cleanup complete for blog_posts.");
        } else {
            console.log("No redundant indices found on blog_posts.");
        }
        
        // Check other tables mentioned in logs if needed (e.g. banners)
        // banners showed ALTER TABLE CHANGE, which doesn't necessarily add keys unless it adds UNIQUE
        
        process.exit(0);
    } catch (error) {
        console.error("Critical error:", error);
        process.exit(1);
    }
}

fix_indices();
