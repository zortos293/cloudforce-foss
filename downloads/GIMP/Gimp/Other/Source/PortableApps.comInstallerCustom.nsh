!macro CustomCodePreInstall
	${If} ${FileExists} "$INSTDIR\App\AppInfo\appinfo.ini"
		ReadINIStr $0 "$INSTDIR\App\AppInfo\appinfo.ini" "Version" "PackageVersion"
		${VersionCompare} $0 "2.10.0.2" $R0
		${If} $R0 == 2
			Rename "$INSTDIR\App\gimp\lib\gimp\2.0\plug-ins" "$INSTDIR\Data\plug-ins-pre-2.10"
			RMDir /r "$INSTDIR\App\gimp"
		${EndIf}
	${EndIf}
	${If} ${FileExists} "$EXEDIR\App\gimp64\*.*"
		Rename "$EXEDIR\App\gimp" "$EXEDIR\App\gimp32"
		Rename "$EXEDIR\App\gimp64" "$EXEDIR\App\gimp"
		Rename "$EXEDIR\App\gimp32\etc" "$EXEDIR\App\gimp\etc"
		Rename "$EXEDIR\App\gimp32\share" "$EXEDIR\App\gimp\share"
		Rename "$EXEDIR\App\gimp32\bin" "$EXEDIR\App\gimp\32\bin"
	${EndIf}
!macroend

!macro CustomCodePostInstall
	RMDir "$INSTDIR\App\gimp\lib\gimp\2.0\plug-ins"
	RMDir "$INSTDIR\App\gimp\lib\gimp\2.0"
	RMDir "$INSTDIR\App\gimp\lib\gimp"
	RMDir "$INSTDIR\App\gimp\lib"
	RMDir "$INSTDIR\App\gimp\share"
	RMDir "$INSTDIR\App\gimp"
	RMDir "$INSTDIR\App\gimp32\lib\gimp\2.0\plug-ins"
	RMDir "$INSTDIR\App\gimp32\lib\gimp\2.0"
	RMDir "$INSTDIR\App\gimp32\lib\gimp"
	RMDir "$INSTDIR\App\gimp32\lib"
	RMDir "$INSTDIR\App\gimp32\share"
	RMDir "$INSTDIR\App\gimp32"
	RMDir "$INSTDIR\App\gimp64\lib\gimp\2.0\plug-ins"
	RMDir "$INSTDIR\App\gimp64\lib\gimp\2.0"
	RMDir "$INSTDIR\App\gimp64\lib\gimp"
	RMDir "$INSTDIR\App\gimp64\lib"
	RMDir "$INSTDIR\App\gimp64\share"
	RMDir "$INSTDIR\App\gimp64"
!macroend
