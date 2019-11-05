---
layout: post
title: Building a Home Media Server with Docker Compose
date: 2019-07-03
---

I recently moved into a bigger condo which had a wall mount pre-installed in the bedroom for a TV, so I decided
to take advantage of it and bought a [second TV](https://www.amazon.ca/gp/product/B07DY5152H/ref=as_li_tl?ie=UTF8&camp=15121&creative=330641&creativeASIN=B07DY5152H&linkCode=as2&tag=eviltrout-20&linkId=08b5818587b23a3ca62b39e33a847386).

Previously, I was using an [Intel NUC](https://www.amazon.ca/gp/product/B01N2UMKZ5/ref=as_li_tl?ie=UTF8&camp=15121&creative=330641&creativeASIN=B01N2UMKZ5&linkCode=as2&tag=eviltrout-20&linkId=b50817b8e8ea4b8eccc3dea40a8fd530) attached to my TV and running [LibreElec](https://libreelec.tv/). If you've not heard of LibreElec, it's a very cool minimal Linux OS that sets itself up to run [Kodi](https://kodi.tv/). It is remarkably easy to set up, and even found and setup my obscure USB remote control automatically.

However, with my second TV that setup wasn't going to cut it, so I decided to repurpose the NUC as a home media server.

### The Plan

1. Move the Intel NUC into my closet with the router and run it as a headless server.

2. Stream content to each TV, as well as any phone or tablet via WiFi.

3. Have the ability to download additional content via torrents and newsgroups.

4. The content should be accessible via a Samba share so computers on my network can read/write it.

### Customizing the NUC

The Intel NUC I purchased has a M.2 slot for a SSD, which I highly recommend as a boot drive. If you buy a NUC, be careful **NOT** to get the one that has 16GB of Optane "Memory." That is not actual RAM like you might expect and it eats up your M.2 SSD slot. I recommend a [Samsung SSD](https://www.amazon.ca/gp/product/B0781Z7Y3S/ref=as_li_tl?ie=UTF8&camp=15121&creative=330641&creativeASIN=B0781Z7Y3S&linkCode=as2&tag=eviltrout-20&linkId=47e0432030da7cc0aa37aaffdebc1e2e).

It does not come with RAM. You probably want 8GB but [16GB would be nicer](https://www.amazon.ca/gp/product/B01HI14AZ4/ref=as_li_tl?ie=UTF8&camp=15121&creative=330641&creativeASIN=B01HI14AZ4&linkCode=as2&tag=eviltrout-20&linkId=4de6aca646d55011846b09fc74ff78f4).

You will want a second hard drive for your media in the NUC's 2.5" slot. My current build has a 2TB drive but if I was building one today I'd throw in a [5TB 2.5" Drive](https://www.amazon.ca/gp/product/B01M0AADIX/ref=as_li_tl?ie=UTF8&camp=15121&creative=330641&creativeASIN=B01M0AADIX&linkCode=as2&tag=eviltrout-20&linkId=b745f96fce63aedb721290672bfa4991). I am not a huge data hoarder so 2TB has lasted me a while but your mileage may vary.


### Installing the OS and Docker

For my build, I used [Ubuntu 64-Bit](https://ubuntu.com/download/desktop) but honestly in this setup we're going to use docker for everything so as long as it can install docker and docker compose easily, you'll be good to go. 

You'll want to attach a keyboard, mouse and monitor until it's all working.

Create a [USB stick](https://tutorials.ubuntu.com/tutorial/tutorial-create-a-usb-stick-on-windows#0) and boot into it on your NUC and do the basic install. You can pretty much use the defaults for everything.

Once everything is installed, we can [install docker](https://docs.docker.com/install/linux/docker-ce/ubuntu/) following the standard instructions.

The last thing you'll want to do is format and mount the second hard drive. If you installed a Desktop linux this is [pretty straightforward](https://askubuntu.com/a/125277). In the examples below I'm going to assume you mounted the drive at `/storage`

### Permissions

One thing I'd recommend doing to make your life a lot easier is to set really global permissions on the `/storage` hard drive:

```
sudo chown nobody:nogroup /storage
sudo chmod 0777 /storage
```

To be clear, this means anyone can read/write the files there. This is a huge security compromise, and I am comfortable with it because I am only storing media on the drive and not anything of importance. I can trust anyone with access to my local network to read and write files in that drive because it'll just be movie files. Make sure this is safely behind your router and not visible to the external world.

### The Magic of Docker Compose

Here's where things get really fun. In the past, I've found setting up and installing server applications somewhat difficult. For example, [sonarr](https://sonarr.tv/) uses Mono. I'm a developer but I've never used .NET and have no idea how to configure and set up a server in that framework. Usually you can follow the instructions in the README, but debugging snags can be difficult when you don't know what you're doing.

Additionally, you have to familiarize yourself with the init/startup scripts for every OS to make sure each server application boots up properly and will restart in the event of a crash.

Finally, updating each server application has a slightly different process. Some are one click via the web app, but others involve package managers or even recompiling code depending on how you installed them.

[Docker Compose](https://docs.docker.com/compose/) solves all these problems, and it does it with a remarkably small amount of configuration.

Here's a simple example which installs sonarr and [nzbget](https://nzbget.net/):

```yaml
---
version: "3"
services:
  sonarr:
    image: linuxserver/sonarr
    container_name: sonarr
    depends_on:
      - nzbget
    environment:
      - PUID=1000
      - PGID=1001
      - TZ=America/Toronto
      - UMASK_SET=022 #optional
    volumes:
      - /docker/sonarr/config:/config
      - /storage/tv:/tv
      - /docker/nzbget/downloads:/downloads
    ports:
      - 8989:8989
    restart: always
  nzbget:
    image: linuxserver/nzbget
    container_name: nzbget
    environment:
      - PUID=1000
      - PGID=1001
      - TZ=America/Toronto
    volumes:
      - /docker/nzbget/config:/config
      - /docker/nzbget/downloads:/downloads
    ports:
      - 6789:6789
    restart: always
```

A few notes:

- I installed all my docker stuff in `/docker` but you can put it anywhere you like. Make sure to create the `/docker/sonarr`, `docker/nzbget` etc directories before you start it up so that the applications have a place to write their files. Note when setting up `volumes` that the paths on the left hand side of the colon are on your local linux box and can be changed. The right hand side is where they'll be visible to the server application.

- `sonarr` has an attribute, `depends_on` for `nzbget`. This means that the nzbget application will start up before sonarr, which is nice because sonarr needs a program to download from newsgroups.

- `restart: always` means that the server applications will be restarted if they crash. They'll also restart automatically if you reboot your computer.

The images in this docker compose configuration come from [linuxserver.io](https://www.linuxserver.io/), which I've found to be reliable and trustworthy. You should find images that suit your purposes and that you trust.

To install everything, go into the same folder as your `docker-compose.yml` and type `docker compose up -d`. It'll download the images and start everything. You can then visit `http://your-server-name:6789` and `http://your-server-name:8989` and start setting things up to your preferences.

How easy is that?

### Adding more applications

In order to stream content to my TVs, I use [Plex](https://www.plex.tv), which can be installed just as easily in the same configuration:

```yaml
  plex:
    image: linuxserver/plex
    container_name: plex
    network_mode: host
    environment:
      - PUID=1000
      - PGID=1001
      - VERSION=docker
    volumes:
      - /docker/plex/config:/config
      - /storage/tv:/data/tvshows
      - /storage/movies:/data/movies
      - /docker/plex/transcode:/transcode
    restart: always
```

Plex is well supported by many streaming sticks, set top boxes and even smart TVs. Personally I am using it via [Infuse](https://firecore.com/infuse) on [Apple TV](https://www.amazon.ca/gp/product/B078865VC3/ref=as_li_tl?ie=UTF8&camp=15121&creative=330641&creativeASIN=B078865VC3&linkCode=as2&tag=eviltrout-20&linkId=c8657876e9e9c98601657509faae1d98) but there are many options depending on your device of choice.

Another nice application is [qBittorrent](https://www.qbittorrent.org/):

```yaml
  qbittorrent:
    image: linuxserver/qbittorrent
    container_name: qbittorrent
    environment:
      - PUID=1000
      - PGID=1001
      - TZ=America/Toronto
      - UMASK_SET=022
      - WEBUI_PORT=8080
    volumes:
      - /docker/qbittorrent/config:/config
      - /docker/qbittorrent/downloads:/downloads
      - /storage/tv:/tv
      - /storage/movies:/movies
    ports:
      - 31321:31321
      - 31321:31321/udp
      - 8080:8080
    restart: always
```

In this case, I have set up port 31321 with port forwarding on my router to make certain torrent services
happy. You can choose any port you want there and set it up in qBittorent accordingly.

### Setting up a Samba Share

If you want to set up a public samba share, I found a great little image for that too! Add the following to your `docker-compose.yml`:

```yaml
  samba:
    image: jenserat/samba-publicshare
    tty: true
    environment:
      - PUID=1000
      - PGID=1001
    ports:
      - 445:445
      - 137:137
      - 138:138
      - 139:139
    volumes:
      - /storage:/srv
```

Now you're off to the races, any computer on the network can access storage to add/remove files as they like.


### Remembering all those ports

If you're like me, you'll have trouble remembering all the custom port numbers for your web applications.
I decided to install [nginx](https://www.nginx.com/) on port 80 so that it would be the default site when I accessed the default port of my media server. On that site I added a simple HTML index page that links to the various services:

```yaml
  nginx:
    image: linuxserver/nginx
    container_name: nginx
    environment:
      - PUID=1000
      - PGID=1001
      - TZ=America/Toronto
    volumes:
      - /docker/nginx/config:/config
    ports:
      - 80:80
      - 443:443
    restart: always
```

My index.html looks like this (my server is named `datacube`):

```html
<html>
  <head>
    <title>datacube</title>
  </head>
  <body>
    <div class="message">
      <h1>datacube</h1>

      <ul>
        <li><a href="http://datacube.local:8080/">qBittorrent</a></li>
        <li><a href="http://datacube.local:6789/">NZBGet</a></li>
        <li><a href="http://datacube.local:8989/">Sonarr</a></li>
        <li><a href="http://datacube.local:32400/">Plex</a></li>
      </ul>
    </div>
  </body>
</html>
```

### Conclusion

In the end I was blown away about how easy Docker Compose makes setting up all these various services, and keeping them running despite crashes and reboots. If you're looking to custom build your own media server or download box I highly recommend this approach.
