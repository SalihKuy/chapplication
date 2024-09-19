# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["back.csproj", "./"]
RUN dotnet restore "back.csproj"
COPY . .
RUN dotnet build "back.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "back.csproj" -c Release -o /app/publish

# Final stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=publish /app/publish .
HEALTHCHECK CMD curl --fail http://localhost:80/health || exit 1
ENTRYPOINT ["dotnet", "back.dll"]