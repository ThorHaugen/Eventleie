@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup script (Windows)
@REM ----------------------------------------------------------------------------
@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "WRAPPER_JAR=%SCRIPT_DIR%.mvn\wrapper\maven-wrapper.jar"
set "WRAPPER_PROPS=%SCRIPT_DIR%.mvn\wrapper\maven-wrapper.properties"

if not exist "%WRAPPER_JAR%" (
  for /f "tokens=1,* delims==" %%A in ('findstr /b "wrapperUrl=" "%WRAPPER_PROPS%"') do set "WRAPPER_URL=%%B"
  echo Downloading Maven Wrapper from %WRAPPER_URL%
  powershell -Command "Invoke-WebRequest -Uri '%WRAPPER_URL%' -OutFile '%WRAPPER_JAR%'"
)

if defined JAVA_HOME (
  set "JAVACMD=%JAVA_HOME%\bin\java.exe"
) else (
  set "JAVACMD=java"
)

"%JAVACMD%" -classpath "%WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%SCRIPT_DIR%" org.apache.maven.wrapper.MavenWrapperMain %*
endlocal
