#!/bin/sh
# ----------------------------------------------------------------------------
# Apache Maven Wrapper startup script (POSIX sh)
# ----------------------------------------------------------------------------
set -euf
[ "${MVNW_VERBOSE:-}" != debug ] || set -x

die () { printf %s\\n "$1" >&2; exit 1; }

case "$(uname)" in
  CYGWIN* | MINGW*) [ -z "${JAVA_HOME:-}" ] || JAVA_HOME="$(cygpath --unix "$JAVA_HOME")" ;;
esac

if [ -z "${JAVA_HOME:-}" ]; then
  JAVACMD="$(command -v java)" || die "JAVA_HOME not set and java not on PATH"
else
  JAVACMD="$JAVA_HOME/bin/java"
  [ -x "$JAVACMD" ] || die "JAVA_HOME ($JAVA_HOME) is not a valid JDK"
fi

script_dir="$(cd "$(dirname "$0")" && pwd)"
wrapper_properties="$script_dir/.mvn/wrapper/maven-wrapper.properties"
[ -r "$wrapper_properties" ] || die "Cannot read $wrapper_properties"

distributionUrl="$(grep '^distributionUrl=' "$wrapper_properties" | cut -d= -f2-)"
wrapperUrl="$(grep '^wrapperUrl=' "$wrapper_properties" | cut -d= -f2-)"
[ -n "$distributionUrl" ] || die "distributionUrl not set in maven-wrapper.properties"

wrapper_jar="$script_dir/.mvn/wrapper/maven-wrapper.jar"

if [ ! -r "$wrapper_jar" ]; then
  printf 'Downloading Maven Wrapper from %s\n' "$wrapperUrl"
  if command -v curl >/dev/null; then
    curl -fsSL -o "$wrapper_jar" "$wrapperUrl" || die "Could not download maven-wrapper.jar"
  elif command -v wget >/dev/null; then
    wget -q -O "$wrapper_jar" "$wrapperUrl" || die "Could not download maven-wrapper.jar"
  else
    die "Need curl or wget to download the Maven Wrapper"
  fi
fi

exec "$JAVACMD" \
  -classpath "$wrapper_jar" \
  "-Dmaven.multiModuleProjectDirectory=$script_dir" \
  org.apache.maven.wrapper.MavenWrapperMain "$@"
