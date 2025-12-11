{{/*
Expand the name of the chart.
*/}}
{{- define "fastfood.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "fastfood.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "fastfood.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "fastfood.labels" -}}
helm.sh/chart: {{ include "fastfood.chart" . }}
{{ include "fastfood.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- with .Values.commonLabels }}
{{ toYaml . }}
{{- end }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "fastfood.selectorLabels" -}}
app.kubernetes.io/name: {{ include "fastfood.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Service labels
*/}}
{{- define "fastfood.serviceLabels" -}}
{{ include "fastfood.labels" . }}
app: {{ .serviceName }}
{{- end }}

{{/*
MongoDB connection string
*/}}
{{- define "fastfood.mongodbUri" -}}
{{- if .Values.mongodb.enabled }}
mongodb://{{ .Values.mongodb.auth.username }}:{{ .Values.mongodb.auth.password }}@{{ .Release.Name }}-mongodb:27017/{{ .Values.mongodb.auth.database }}
{{- else }}
{{- .Values.externalMongodb.uri }}
{{- end }}
{{- end }}

{{/*
Redis connection string
*/}}
{{- define "fastfood.redisUri" -}}
{{- if .Values.redis.enabled }}
redis://{{ .Release.Name }}-redis-master:6379
{{- else }}
{{- .Values.externalRedis.uri }}
{{- end }}
{{- end }}
