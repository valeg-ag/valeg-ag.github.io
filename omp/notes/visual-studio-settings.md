## Настройки Visual Studio

### Плагины

#### !!! Отключаем автоматическую установку обновлений для плагинов

Важно сделать это до установки расширений.

> Иначе Qt Visual Studio Tools 2.9.0 обновится до версии, которая не работает с нашим проектом

Идем в настройки по пути `All Settings` > `Environment` > `Extensions` и снимаем галочку `Install updates automatically`. Перезаходим в студию.

#### Список плагинов

- TGit
- Output enhancer
- Customize Visual Studio Window Title
- Spell Check My Code (VS2022 and Later) (EWSoftware)
- OMPDebugPlugin `\\omp03\OMPInstall\VisualStudio\Debug addin\OMPDebugPlugin_2022.vsix`
- Qt Visual Studio Tools 2.9.0 `\\omp03\OMPInstall\VisualStudio\Qt addin\OMPQtVsTools\2.9.0\qt-vsaddin2022.vsix`

### Отключаем папку External Dependencies в Solution Explorer

Идем в настройки по пути `All Settings` > `Languages` > `C/C++` > `IntelliSence` > `Browsing & Navigation` и снимаем галочку `Show external dependencies in solution Explorer`.

> Это нужно для того, чтобы переход по F12 по заголовочному файлу открывал заголовочный в контексте правильного проекта. Иначе студия откроет его в Solution Explorer в папке External Dependencies текущем проекте, там видны только *.h-файлы, соответственно, простой переход к *.cpp будет невозможен. 

### Запрещаем студии использовать `Preview Tab`

Идем в настройки по пути `All Settings` > `Environment` > `Tabs` > `Preview Tab` и снимаем галочку `Allow new files to be opened in the preview tab`.
