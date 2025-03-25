# raycast-ntfy

Send notifications to your devices using ntfy.sh
For more information visit their [documentation][ntfy-doc]

> [!IMPORTANT]
> Topics on ntfy.sh are public by default.

## Configuration

Set a topic that is difficult to guess to avoid your notifications being delivered to others.

I suggest generating a random id with [nanoid][nanoid-gen]
> Example: ygJYwllDVqbY_I-iI0YVG

Then install the [ntfy app][ntfy-app] and subscribe to the topic on your phone.

## Privacy and self-hosting

Ntfy.sh is a public service, but you can also [host your own server][ntfy-self-host].
If you want a fast way to setup the server I suggest trying their [Docker image][ntfy-docker]

## Notes

I am not the owner or maintainer of [ntfy.sh][ntfy], but I am always available to help.

## About Wés

I'm a web developer who loves the web and the javascript ecosystem, find me everywhere as @wesleycoder or at [guima.dev][guima]

[guima]: https://guima.dev
[ntfy]: https://ntfy.sh/
[ntfy-doc]: https://docs.ntfy.sh/
[ntfy-app]: https://docs.ntfy.sh/#step-1-get-the-app
[nanoid-gen]: https://nanoid.jormaechea.com.ar/
[ntfy-docker]: https://docs.ntfy.sh/install/#docker
[ntfy-self-host]: https://docs.ntfy.sh/install/
