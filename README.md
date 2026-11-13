# MOLINA LIST

Demon list de tu grupo. El front vive en GitHub Pages y los datos en Supabase (gratis).
No hay que instalar nada: es HTML/CSS/JS puro.

## Instalación (unos 10 minutos)

1. **Supabase:** creá una cuenta en supabase.com y un proyecto nuevo.
2. **Tablas:** en *SQL Editor*, pegá todo `supabase.sql` y tocá *Run*.
3. **Bloqueá los registros (importante):** en *Authentication*, desactivá *Allow new users to sign up*
   (el nombre del menú puede variar un poco). Si no lo hacés, cualquiera se podría registrar y editar la lista.
4. **Creá el admin:** en *Authentication > Users > Add user*, poné un email y una contraseña y tildá *Auto confirm user*.
   Esa es la cuenta con la que se edita. Pueden compartirla o crear una por persona.
5. **Claves:** en *Project Settings > API* copiá el *Project URL* y la clave *anon public*, y pegalas en `config.js`.
   No uses la `service_role`.
6. **GitHub:** creá un repo, subí todos los archivos de esta carpeta, y en *Settings > Pages* elegí
   *Deploy from a branch*, rama `main`, carpeta `/ (root)`. En un minuto te da el link.
7. **Usarla:** entrá a la página, tocá *Admin*, iniciá sesión y usá *Nuevo record*.

## Cómo se ordena

- **Con top AREDL:** el nivel va después del nivel con top AREDL inmediatamente anterior (y de los niveles
  manuales que estén pegados debajo de ese). Los puestos de todos se renumeran solos.
- **Sin top AREDL:** elegís debajo de qué nivel va y el resto se corre.
- *Subir* y *Bajar* (en el detalle del nivel) sirven para ajustes manuales.

## Notas

- Si el ID ya existe, el record se suma a ese nivel. Si no, se crea el nivel nuevo.
- Records de 100% se marcan en verde; los de menos, se muestran con su porcentaje.
- "Traer datos del nivel" intenta completar nombre, creador y top AREDL. Si una API no responde, completás a mano.
- La fecha que se muestra es la de carga del record.
