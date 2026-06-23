BUILD_BASE_IMAGE ?= $(shell grep -m1 'FROM registry.access.redhat.com/ubi9/ubi-minimal' build-tools/Dockerfile | awk '{print $$2}')
RUNTIME_BASE_IMAGE ?= $(shell grep -m1 'FROM registry.access.redhat.com/ubi9/nginx-122' build-tools/Dockerfile | awk '{print $$2}')

.PHONY: ubi.repo rpms.in.yaml generate-rpm-lockfile

# Extract the UBI repo configuration from the base image
ubi.repo:
	podman run --rm $(BUILD_BASE_IMAGE) bash -c 'cat /etc/yum.repos.d/ubi.repo' > ubi.repo
	sed -i 's/ubi-9-codeready-builder/codeready-builder-for-ubi-9-$$basearch/' ubi.repo
	sed -i 's/\[ubi-9/[ubi-9-for-$$basearch/' ubi.repo

# Generate rpms.in.yaml from the packages installed in build-tools/Dockerfile
rpms.in.yaml:
	@cat > rpms.in.yaml <<-EOF
	---
	contentOrigin:
	  repofiles:
	  - "./ubi.repo"
	arches:
	- x86_64
	moduleEnable:
	- nodejs:22
	packages:
	- nodejs
	- npm
	EOF

# Resolve and lock all RPM dependencies.
# --image excludes packages already present in the base image from the lockfile.
generate-rpm-lockfile: ubi.repo rpms.in.yaml
	rpm-lockfile-prototype --image $(BUILD_BASE_IMAGE) rpms.in.yaml --outfile rpms.lock.yaml
