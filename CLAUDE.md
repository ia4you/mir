# MIR Turel

## Normas

- Nunca ejecutar comandos destructivos de Docker ni del sistema (docker system/volume/image/container prune, docker volume rm, rm -rf fuera de carpetas temporales propias) sin el OK expreso de José. Para limpiar pruebas, borrar solo el contenedor concreto con docker rm -f -v <nombre>.
