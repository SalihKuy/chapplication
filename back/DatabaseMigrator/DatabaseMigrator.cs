
using Microsoft.AspNetCore.Builder;

using Microsoft.Extensions.DependencyInjection;

using back.Data;

using Microsoft.EntityFrameworkCore;

public static class DatabaseMigrator

{

    public static IApplicationBuilder MigrateDatabase(this IApplicationBuilder app)

    {

        using (var serviceScope = app.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope())

        {

            var dbContext = serviceScope.ServiceProvider.GetService<ApplicationDBContext>();
            if(dbContext == null)
            {
                return app;
            }
            dbContext.Database.Migrate();

        }

        return app;

    }

}
