FROM gradle:jdk21 AS build
WORKDIR /app
COPY . /app
RUN chmod +x ./gradlew && \
    ./gradlew build


FROM openjdk:21
COPY --from=build /app/build/libs/product-0.0.1-SNAPSHOT.jar ./product.jar
CMD [ "java", "-jar", "product.jar" ]
# java -jar order.jar --inventory.client.url=http://inventory-8080-tcp.my-app-cluster:8080/api/inventories
